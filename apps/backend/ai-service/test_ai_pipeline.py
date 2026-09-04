"""
Unit & Sanity Verification Test for YOLOv11 & AI Authenticity Detector
"""

import sys
import numpy as np
from PIL import Image, ImageDraw
from detector import YoloV11CivicDetector
from authenticity import AiImageAuthenticityDetector


def generate_synthetic_pothole_image():
    """Create a realistic asphalt road image with a pothole cavity."""
    img = Image.new("RGB", (640, 480), color=(60, 62, 65))
    draw = ImageDraw.Draw(img)

    # Draw asphalt gravel texture / noise
    np.random.seed(42)
    noise = np.random.randint(-20, 20, (480, 640, 3), dtype=np.int16)
    img_arr = np.clip(np.array(img, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
    noisy_img = Image.fromarray(img_arr)
    draw_noisy = ImageDraw.Draw(noisy_img)

    # Draw road lane markings
    draw_noisy.rectangle([310, 0, 330, 100], fill=(240, 240, 240))
    draw_noisy.rectangle([310, 200, 330, 300], fill=(240, 240, 240))
    draw_noisy.rectangle([310, 400, 330, 480], fill=(240, 240, 240))

    # Draw large dark pothole depression in the road
    draw_noisy.ellipse([180, 160, 440, 340], fill=(25, 25, 28), outline=(15, 15, 18))
    draw_noisy.ellipse([210, 190, 390, 300], fill=(12, 12, 15))

    return noisy_img


def generate_fake_ai_image():
    """Create an AI-like image with smooth gradients and AI metadata tag."""
    img = Image.new("RGB", (512, 512), color=(120, 140, 200))
    draw = ImageDraw.Draw(img)
    for y in range(512):
        r = int(120 + 80 * (y / 512))
        g = int(140 + 60 * (y / 512))
        b = int(200 + 40 * (y / 512))
        draw.line([(0, y), (512, y)], fill=(r, g, b))

    # Attach AI generator signature to image info dictionary
    img.info["prompt"] = "hyperrealistic high quality pothole in asphalt road, 8k octane render, cinematic lighting"
    img.info["parameters"] = "Steps: 30, Sampler: DPM++ 2M Karras, Model: sd-xl"
    return img


def test_pipeline():
    print("=== 1. Initializing YOLOv11 Civic Detector ===")
    detector = YoloV11CivicDetector()
    print(f"Model loaded: {detector.model_name}")

    print("\n=== 2. Testing Road Damage & Severity Scoring on Camera Photo ===")
    pothole_img = generate_synthetic_pothole_image()
    det_result = detector.detect_and_score(pothole_img, category_hint="pothole")
    print(f"Detected category: {det_result['category']}")
    print(f"Visual Severity Score (S): {det_result['visualSeverityScore']}/100")
    print(f"Overall Confidence: {det_result['overallConfidence']}")
    print(f"Number of detections: {len(det_result['detections'])}")
    for i, d in enumerate(det_result['detections']):
        print(f"  [{i+1}] {d['label']} - BBox: {d['bbox']} - Sev Contribution: {d['severityContribution']}")
    assert det_result["visualSeverityScore"] > 0, "Severity score should be > 0"
    assert det_result["annotatedImageUrl"].startswith("data:image/jpeg;base64,"), "Annotated image missing base64"

    print("\n=== 3. Testing Authenticity on Real Camera Photo ===")
    authenticity_detector = AiImageAuthenticityDetector()
    real_auth = authenticity_detector.analyze(pothole_img)
    print(f"Real Image Verdict: {real_auth['authenticityLabel']}")
    print(f"Is AI Generated: {real_auth['isAiGenerated']} (Confidence: {real_auth['confidence']})")
    print(f"Indicators: {real_auth['indicators']}")

    print("\n=== 4. Testing Authenticity on AI-Generated Image ===")
    fake_ai_img = generate_fake_ai_image()
    fake_auth = authenticity_detector.analyze(fake_ai_img)
    print(f"Fake Image Verdict: {fake_auth['authenticityLabel']}")
    print(f"Is AI Generated: {fake_auth['isAiGenerated']} (Confidence: {fake_auth['confidence']})")
    print(f"Indicators: {fake_auth['indicators']}")
    assert fake_auth["isAiGenerated"] is True, "AI image should be flagged as AI generated!"

    print("\n=== 5. Testing Worker Resolution Before/After Verification ===")
    repaired_img = Image.new("RGB", (640, 480), color=(80, 82, 85)) # clean uniform patched road
    verif = detector.verify_resolution(pothole_img, repaired_img, category="pothole")
    print(f"Resolution Status: {'RESOLVED' if verif['isResolved'] else 'NOT RESOLVED'}")
    print(f"Before Severity: {verif['beforeSeverityScore']} -> After Severity: {verif['afterSeverityScore']}")
    print(f"Severity Reduction: {verif['severityReductionPercent']}%")
    print(f"Verification Notes: {verif['notes']}")
    assert verif["isResolved"] is True, "Paved road should be verified as resolved"

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    test_pipeline()

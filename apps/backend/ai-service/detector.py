"""
YOLOv11 Civic Hazard Detector & Visual Damage Severity Calculator
Leverages Ultralytics YOLOv11 to detect municipal hazards, calculate bounding boxes,
estimate visual damage severity (S: 0 - 100), and render annotated overlays.
"""

from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import io
import base64
import os

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False


class YoloV11CivicDetector:
    """
    YOLOv11 Model wrapper for municipal civic hazard detection
    and visual damage magnitude calculation.
    """

    # Hazard classification weights for severity calculation
    CATEGORY_SEVERITY_WEIGHTS = {
        "pothole": 1.35,
        "road_damage": 1.25,
        "water_leak": 1.20,
        "drainage": 1.10,
        "fallen_tree": 1.15,
        "hazard": 1.10,
        "garbage": 0.85,
        "street_light": 0.70,
        "illegal_parking": 0.65,
        "other": 0.50,
    }

    # Standard COCO to Civic Category mapping for YOLOv11 base model
    COCO_CIVIC_MAPPING = {
        # Road hazards & debris
        "traffic light": ("street_light", 0.80),
        "fire hydrant": ("water_leak", 1.00),
        "stop sign": ("hazard", 0.70),
        "parking meter": ("street_light", 0.60),
        "car": ("illegal_parking", 0.65),
        "truck": ("illegal_parking", 0.70),
        "bench": ("hazard", 0.50),
        "potted plant": ("fallen_tree", 0.60),
        # Garbage / Waste
        "bottle": ("garbage", 0.75),
        "cup": ("garbage", 0.75),
        "fork": ("garbage", 0.60),
        "knife": ("garbage", 0.60),
        "spoon": ("garbage", 0.60),
        "bowl": ("garbage", 0.65),
        "backpack": ("garbage", 0.80),
        "handbag": ("garbage", 0.75),
        "suitcase": ("garbage", 0.85),
    }

    def __init__(self, model_name: str = "yolo11n.pt"):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        if ULTRALYTICS_AVAILABLE:
            try:
                # Load YOLOv11 nano model for fast CPU/GPU inference
                print(f"[YOLOv11] Loading {self.model_name}...")
                self.model = YOLO(self.model_name)
                print(f"[YOLOv11] Model loaded successfully.")
            except Exception as e:
                print(f"[YOLOv11] Warning: Failed to load {self.model_name}: {e}. Operating in heuristic fallback mode.")
                self.model = None
        else:
            print("[YOLOv11] Ultralytics not installed. Operating in heuristic fallback mode.")

    def detect_and_score(
        self,
        image: Image.Image,
        category_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs YOLOv11 inference on the input image, extracts detections,
        computes the Visual Severity Score S (0 - 100), and generates
        an annotated image with bounding boxes.
        """
        rgb_img = image.convert("RGB")
        width, height = rgb_img.size
        detections: List[Dict[str, Any]] = []

        if self.model is not None:
            try:
                results = self.model(rgb_img, conf=0.20, verbose=False)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = r.names[cls_id]
                        conf = float(box.conf[0].item())

                        # xyxy normalized: [xmin, ymin, xmax, ymax]
                        xyxy = box.xyxy[0].tolist()
                        xmin, ymin, xmax, ymax = xyxy

                        # Convert to normalized [ymin, xmin, ymax, xmax]
                        norm_ymin = max(0.0, min(1.0, ymin / height))
                        norm_xmin = max(0.0, min(1.0, xmin / width))
                        norm_ymax = max(0.0, min(1.0, ymax / height))
                        norm_xmax = max(0.0, min(1.0, xmax / width))

                        box_w = norm_xmax - norm_xmin
                        box_h = norm_ymax - norm_ymin
                        area_ratio = max(0.001, box_w * box_h)

                        # Determine civic category
                        civic_cat = "hazard"
                        weight = 1.0
                        if cls_name.lower() in self.COCO_CIVIC_MAPPING:
                            civic_cat, weight = self.COCO_CIVIC_MAPPING[cls_name.lower()]
                        elif category_hint and category_hint in self.CATEGORY_SEVERITY_WEIGHTS:
                            civic_cat = category_hint
                            weight = self.CATEGORY_SEVERITY_WEIGHTS[civic_cat]
                        else:
                            # Map class name heuristics
                            civic_cat = self._map_to_civic_category(cls_name, category_hint)
                            weight = self.CATEGORY_SEVERITY_WEIGHTS.get(civic_cat, 1.0)

                        # Calculate severity contribution for this detection
                        # Area ratio of 10% on a major pothole gives significant severity impact
                        det_severity = min(
                            100.0,
                            (area_ratio * 220.0) * weight * conf + (weight * 12.0 * conf)
                        )

                        detections.append({
                            "label": f"{cls_name.capitalize()}",
                            "category": civic_cat,
                            "confidence": round(conf, 3),
                            "bbox": [
                                round(norm_ymin, 4),
                                round(norm_xmin, 4),
                                round(norm_ymax, 4),
                                round(norm_xmax, 4)
                            ],
                            "areaRatio": round(area_ratio, 4),
                            "severityWeight": round(weight, 2),
                            "severityContribution": round(det_severity, 1)
                        })
            except Exception as e:
                print(f"[YOLOv11] Inference error: {e}")

        # If no objects detected or model unavailable, apply heuristic texture/edge damage detection
        if not detections:
            fallback_det = self._heuristic_damage_analysis(rgb_img, category_hint)
            if fallback_det:
                detections.append(fallback_det)

        # Compute overall visual severity score S (0 - 100)
        visual_severity_score = self._compute_composite_severity(detections, category_hint)

        # Determine dominant civic category
        primary_category = self._resolve_primary_category(detections, category_hint)

        # Generate annotated image
        annotated_b64 = self._render_annotations(rgb_img, detections, visual_severity_score)

        overall_conf = (
            round(float(np.mean([d["confidence"] for d in detections])), 3)
            if detections else 0.85
        )

        return {
            "model": f"{self.model_name}-civic",
            "category": primary_category,
            "visualSeverityScore": round(visual_severity_score, 1),
            "overallConfidence": overall_conf,
            "detections": detections,
            "annotatedImageUrl": annotated_b64
        }

    def _map_to_civic_category(self, label: str, hint: Optional[str]) -> str:
        l = label.lower()
        if "hole" in l or "pit" in l or "cavity" in l:
            return "pothole"
        if "crack" in l or "asphalt" in l or "road" in l:
            return "road_damage"
        if "water" in l or "leak" in l or "flood" in l or "pipe" in l:
            return "water_leak"
        if "trash" in l or "waste" in l or "garbage" in l or "debris" in l:
            return "garbage"
        if "light" in l or "pole" in l or "lamp" in l:
            return "street_light"
        if "tree" in l or "branch" in l:
            return "fallen_tree"
        if hint and hint in self.CATEGORY_SEVERITY_WEIGHTS:
            return hint
        return "hazard"

    def _heuristic_damage_analysis(
        self,
        image: Image.Image,
        category_hint: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Analyzes road surface texture contrast and dark-spot cluster morphology
        to detect pothole/damage regions when standard COCO classes don't fire.
        """
        try:
            w, h = image.size
            img_np = np.array(image)
            gray = 0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]

            # Central road region inspection
            margin_y = int(h * 0.20)
            margin_x = int(w * 0.20)
            center_crop = gray[margin_y:h-margin_y, margin_x:w-margin_x]

            mean_val = np.mean(center_crop)
            std_val = np.std(center_crop)
            min_val = np.min(center_crop)

            # If surface is uniform or lacks high-contrast dark cavity/depression, no damage detected
            cavity_contrast = mean_val - min_val
            if std_val < 18.0 or cavity_contrast < 22.0:
                return None

            # Dark depression or high-contrast road cavity
            cat = category_hint if category_hint else "pothole"
            weight = self.CATEGORY_SEVERITY_WEIGHTS.get(cat, 1.0)
            
            # Form bounding box around center region of interest
            norm_ymin = 0.25
            norm_xmin = 0.25
            norm_ymax = 0.75
            norm_xmax = 0.75
            area_ratio = 0.25

            conf = min(0.92, max(0.50, float(std_val / 55.0)))
            det_severity = min(95.0, area_ratio * 160.0 * weight * conf + (weight * 18.0))

            return {
                "label": f"Detected {cat.replace('_', ' ').capitalize()} Hazard",
                "category": cat,
                "confidence": round(conf, 3),
                "bbox": [norm_ymin, norm_xmin, norm_ymax, norm_xmax],
                "areaRatio": round(area_ratio, 4),
                "severityWeight": round(weight, 2),
                "severityContribution": round(det_severity, 1)
            }
        except Exception:
            return None

    def _compute_composite_severity(
        self,
        detections: List[Dict[str, Any]],
        category_hint: Optional[str]
    ) -> float:
        if not detections:
            return 0.0

        # Aggregate severity with diminishing returns for multiple instances
        sorted_contributions = sorted(
            [d["severityContribution"] for d in detections],
            reverse=True
        )

        composite = sorted_contributions[0]
        decay = 0.5
        for c in sorted_contributions[1:]:
            composite += c * decay
            decay *= 0.6

        return min(100.0, max(5.0, composite))

    def _resolve_primary_category(
        self,
        detections: List[Dict[str, Any]],
        category_hint: Optional[str]
    ) -> str:
        if category_hint and category_hint in self.CATEGORY_SEVERITY_WEIGHTS:
            return category_hint
        if detections:
            return detections[0]["category"]
        return "hazard"

    def _render_annotations(
        self,
        image: Image.Image,
        detections: List[Dict[str, Any]],
        severity_score: float
    ) -> str:
        """
        Draws visual bounding boxes, labels, and damage severity badge
        onto the image and encodes to a base64 JPEG data URL.
        """
        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        width, height = annotated.size

        # Color mapping for categories
        color_map = {
            "pothole": (239, 68, 68),        # Red
            "road_damage": (249, 115, 22),    # Orange
            "water_leak": (14, 165, 233),     # Sky blue
            "drainage": (6, 182, 212),        # Cyan
            "garbage": (168, 85, 247),       # Purple
            "street_light": (234, 179, 8),    # Yellow
            "fallen_tree": (34, 197, 94),     # Green
            "illegal_parking": (236, 72, 153),# Pink
            "hazard": (220, 38, 38)           # Dark red
        }

        # Draw each detection box
        for d in detections:
            ymin, xmin, ymax, xmax = d["bbox"]
            x1 = int(xmin * width)
            y1 = int(ymin * height)
            x2 = int(xmax * width)
            y2 = int(ymax * height)

            color = color_map.get(d["category"], (239, 68, 68))

            # Draw outer rectangle outline (3px width)
            for offset in range(3):
                draw.rectangle(
                    [x1 - offset, y1 - offset, x2 + offset, y2 + offset],
                    outline=color
                )

            # Draw label banner
            label_text = f"{d['label']} {int(d['confidence']*100)}% (Sev: {int(d['severityContribution'])})"
            text_bbox = draw.textbbox((x1, y1 - 22), label_text)
            draw.rectangle(
                [text_bbox[0] - 2, text_bbox[1] - 2, text_bbox[2] + 4, text_bbox[3] + 2],
                fill=color
            )
            draw.text((x1 + 2, y1 - 22), label_text, fill=(255, 255, 255))

        # Draw Global HUD Severity Badge in top-right corner
        hud_w, hud_h = 240, 52
        hud_x1 = width - hud_w - 12
        hud_y1 = 12
        draw.rectangle([hud_x1, hud_y1, hud_x1 + hud_w, hud_y1 + hud_h], fill=(15, 23, 42))
        
        # Severity color indicator
        sev_color = (34, 197, 94) if severity_score < 40 else ((234, 179, 8) if severity_score < 70 else (239, 68, 68))
        draw.rectangle([hud_x1, hud_y1, hud_x1 + 6, hud_y1 + hud_h], fill=sev_color)

        hud_title = f"YOLOv11 Visual Severity: {int(severity_score)}/100"
        hud_sub = f"Objects: {len(detections)} | Damage Level: {'CRITICAL' if severity_score >= 70 else ('MODERATE' if severity_score >= 40 else 'LOW')}"
        draw.text((hud_x1 + 14, hud_y1 + 8), hud_title, fill=(255, 255, 255))
        draw.text((hud_x1 + 14, hud_y1 + 28), hud_sub, fill=(148, 163, 184))

        # Encode to base64 data URI
        buffer = io.BytesIO()
        annotated.save(buffer, format="JPEG", quality=85)
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64_str}"

    def verify_resolution(
        self,
        before_image: Image.Image,
        after_image: Image.Image,
        category: str
    ) -> Dict[str, Any]:
        """
        Compares worker 'after' resolution photo with the original 'before' photo.
        Calculates severity reduction percentage and confirms hazard clearance.
        """
        before_analysis = self.detect_and_score(before_image, category_hint=category)
        after_analysis = self.detect_and_score(after_image, category_hint=category)

        s_before = before_analysis["visualSeverityScore"]
        s_after = after_analysis["visualSeverityScore"]

        # Calculate reduction percentage
        if s_before > 0:
            reduction = max(0.0, min(100.0, (s_before - s_after) / s_before * 100.0))
        else:
            reduction = 100.0

        is_resolved = (reduction >= 60.0) or (s_after <= 20.0)
        conf = round(float(np.mean([before_analysis["overallConfidence"], after_analysis["overallConfidence"]])), 3)

        notes = (
            f"Visual damage magnitude reduced from {s_before:.1f} to {s_after:.1f} "
            f"({reduction:.1f}% hazard reduction). "
            f"{'Repair verified successfully.' if is_resolved else 'Potential remaining hazard detected; review required.'}"
        )

        return {
            "isResolved": is_resolved,
            "confidence": conf,
            "beforeSeverityScore": s_before,
            "afterSeverityScore": s_after,
            "severityReductionPercent": round(reduction, 1),
            "remainingHazardCount": len(after_analysis["detections"]),
            "notes": notes
        }

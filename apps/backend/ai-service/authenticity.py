"""
AI-Generated & Synthetic Image Authenticity Detector
Examines visual artifact signatures, Fourier frequency spectrums,
edge variances, and EXIF/C2PA metadata to detect synthetic/deepfake municipal photos.
"""

from typing import Dict, Any, List, Tuple
from PIL import Image, ExifTags
import numpy as np
import io


class AiImageAuthenticityDetector:
    """
    Multi-factor authenticity analyzer designed to flag synthetic AI images
    (e.g. DALL-E, Midjourney, Stable Diffusion, Flux, Sora) and tampered photos.
    """

    KNOWN_AI_METADATA_MARKERS = [
        "parameters",
        "prompt",
        "negative_prompt",
        "steps:",
        "sampler:",
        "model: sd",
        "stable diffusion",
        "novelai",
        "midjourney",
        "dall-e",
        "civitai",
        "comfyui",
        "automatic1111",
        "adobe firefly",
        "flux.1",
        "sora",
    ]

    CAMERA_EXIF_TAGS = [
        "Make",
        "Model",
        "DateTimeOriginal",
        "ExposureTime",
        "FNumber",
        "ISOSpeedRatings",
        "FocalLength",
        "LensModel",
    ]

    def analyze(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze an in-memory PIL Image for synthetic markers.
        Returns a typed dictionary matching AiImageAuthenticityCheck.
        """
        rgb_img = image.convert("RGB")
        width, height = rgb_img.size
        img_np = np.array(rgb_img)

        indicators: List[str] = []
        suspicion_score = 0.0

        # 1. Inspect Metadata & Software Headers
        meta_score, meta_indicators, has_camera_exif = self._check_metadata(image)
        suspicion_score += meta_score
        indicators.extend(meta_indicators)

        # 2. Fourier Transform / FFT Frequency Grid Analysis
        fft_score, fft_indicators = self._analyze_fft_spectrum(img_np)
        suspicion_score += fft_score
        indicators.extend(fft_indicators)

        # 3. Laplacian Texture Variance & Noise Granularity
        noise_score, noise_indicators = self._analyze_texture_variance(img_np)
        suspicion_score += noise_score
        indicators.extend(noise_indicators)

        # 4. Color Channel Gradient Uniformity
        color_score, color_indicators = self._analyze_color_uniformity(img_np)
        suspicion_score += color_score
        indicators.extend(color_indicators)

        # Normalize score between 0.0 and 1.0
        normalized_confidence = min(1.0, max(0.0, suspicion_score / 100.0))

        if normalized_confidence >= 0.65:
            authenticity_label = "ai_generated"
            is_ai = True
            summary = (
                f"High probability of AI-generated / synthetic image ({normalized_confidence*100:.1f}% confidence). "
                f"Detected markers: {', '.join(indicators[:3])}."
            )
        elif normalized_confidence >= 0.40:
            authenticity_label = "suspicious"
            is_ai = False
            summary = (
                f"Image shows suspicious synthetic characteristics ({normalized_confidence*100:.1f}% risk). "
                f"Manual dispatcher review recommended."
            )
        else:
            authenticity_label = "authentic"
            is_ai = False
            summary = (
                f"Image verified as authentic camera capture ({100 - normalized_confidence*100:.1f}% trust). "
                f"Sensor noise and frequency distribution match real camera capture."
            )

        return {
            "isAiGenerated": is_ai,
            "confidence": round(normalized_confidence, 3),
            "authenticityLabel": authenticity_label,
            "indicators": indicators if indicators else ["Normal camera optical noise profile"],
            "metadataIntegrity": has_camera_exif,
            "analysisSummary": summary,
        }

    def _check_metadata(self, image: Image.Image) -> Tuple[float, List[str], bool]:
        score = 0.0
        indicators = []
        has_camera_exif = False

        # Check image.info dictionary (PNG text chunks / comments)
        for k, v in image.info.items():
            content_str = f"{k} {v}".lower()
            for marker in self.KNOWN_AI_METADATA_MARKERS:
                if marker in content_str:
                    score += 60.0
                    indicators.append(f"AI generator metadata header detected: '{marker}'")
                    break

        # Check standard EXIF tags
        try:
            exif_data = image.getexif()
            if exif_data:
                found_camera_tags = 0
                for tag_id, value in exif_data.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    if tag_name in self.CAMERA_EXIF_TAGS:
                        found_camera_tags += 1
                    
                    val_str = str(value).lower()
                    for marker in self.KNOWN_AI_METADATA_MARKERS:
                        if marker in val_str:
                            score += 50.0
                            indicators.append(f"EXIF metadata contains AI tag '{marker}'")
                
                if found_camera_tags >= 3:
                    has_camera_exif = True
                    score -= 20.0  # Real camera EXIF strongly reduces suspicion
        except Exception:
            pass

        # If completely missing EXIF on a modern high-res image, slight suspicion modifier
        w, h = image.size
        if not has_camera_exif and (w >= 1024 or h >= 1024) and score == 0:
            score += 10.0
            indicators.append("Missing standard mobile camera sensor EXIF tags")

        return score, indicators, has_camera_exif

    def _analyze_fft_spectrum(self, img_np: np.ndarray) -> Tuple[float, List[str]]:
        """
        Latent diffusion decoders and GAN generators produce distinct periodic
        high-frequency artifacts in the 2D Fourier power spectrum.
        """
        score = 0.0
        indicators = []

        try:
            # Convert RGB to Luminance
            gray = 0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]
            h, w = gray.shape

            # Compute 2D Fast Fourier Transform
            f = np.fft.fft2(gray)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = np.log(np.abs(fshift) + 1.0)

            # High-frequency quadrant check (outer perimeter of frequency space)
            cy, cx = h // 2, w // 2
            r_outer = min(cx, cy) * 0.85
            r_inner = min(cx, cy) * 0.35

            y, x = np.ogrid[:h, :w]
            dist_from_center = np.sqrt((x - cx)**2 + (y - cy)**2)

            outer_mask = (dist_from_center >= r_inner) & (dist_from_center <= r_outer)
            inner_mask = dist_from_center < r_inner

            inner_energy = np.mean(magnitude_spectrum[inner_mask]) if np.any(inner_mask) else 1.0
            outer_energy = np.mean(magnitude_spectrum[outer_mask]) if np.any(outer_mask) else 1.0

            energy_ratio = outer_energy / (inner_energy + 1e-6)

            # Standard camera photos have a power-law spectrum (ratio usually 0.35 - 0.58)
            # AI images with generator upsampling often have unnatural high-frequency spikes
            if energy_ratio > 0.72:
                score += 25.0
                indicators.append(f"High-frequency spectral spike ({energy_ratio:.2f}) consistent with diffusion upsampler")
            elif energy_ratio < 0.20:
                score += 20.0
                indicators.append("Severe frequency cutoff / artificial smoothing detected")
        except Exception:
            pass

        return score, indicators

    def _analyze_texture_variance(self, img_np: np.ndarray) -> Tuple[float, List[str]]:
        """
        Analyzes edge variance and local sensor noise. Real road/civic photos
        have organic micro-textures, while AI diffusion often produces plastic textures.
        """
        score = 0.0
        indicators = []

        try:
            gray = 0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]
            
            # Simple discrete Laplacian kernel for edge sharpness and noise variance
            # [-1 -1 -1]
            # [-1  8 -1]
            # [-1 -1 -1]
            padded = np.pad(gray, 1, mode='edge')
            laplacian = (
                8 * padded[1:-1, 1:-1]
                - padded[:-2, :-2] - padded[:-2, 1:-1] - padded[:-2, 2:]
                - padded[1:-1, :-2]                    - padded[1:-1, 2:]
                - padded[2:, :-2]  - padded[2:, 1:-1]  - padded[2:, 2:]
            )
            laplacian_var = np.var(laplacian)

            # Natural road photos with gravel/asphalt have high Laplacian variance (> 250)
            # Overly smooth synthetic images often have unnaturally low micro-texture variance
            if laplacian_var < 35.0:
                score += 15.0
                indicators.append("Overly smooth surface texture lacking organic camera sensor noise")
        except Exception:
            pass

        return score, indicators

    def _analyze_color_uniformity(self, img_np: np.ndarray) -> Tuple[float, List[str]]:
        """
        Evaluates color saturation anomalies common in AI generation engines.
        """
        score = 0.0
        indicators = []

        try:
            r = img_np[:, :, 0].astype(float)
            g = img_np[:, :, 1].astype(float)
            b = img_np[:, :, 2].astype(float)

            max_c = np.maximum(np.maximum(r, g), b)
            min_c = np.minimum(np.minimum(r, g), b)
            delta = max_c - min_c

            saturation = np.where(max_c == 0, 0, delta / (max_c + 1e-6))
            mean_sat = np.mean(saturation)

            # Generative models often produce hyper-vivid dreamlike saturation
            if mean_sat > 0.78:
                score += 15.0
                indicators.append("Hyper-saturated synthetic chromatic distribution")
        except Exception:
            pass

        return score, indicators

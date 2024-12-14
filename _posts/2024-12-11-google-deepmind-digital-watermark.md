---
title: 구글 딥마인드 SynthID와 디지털 워터마크의 원리
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [AI]
tags: [SynthID]
pin: false
math: true
mermaid: true
---

AI로 만들어진 이미지인지 여부는 어떻게 확인할까요?

### SynthID
구글 딥마인드에서 SynthID라는 툴로 워터마킹을 이미지에 추가할 수 있고, AI 이미지 여부도 확인할 수 있는 툴을 런칭했습니다.  
현재는 Imagen을 사용하는 Vertex AI 고객에게 제한적으로 출시된 도구입니다. (SynthID를 다른 제품에 통합하고 제3자 사용자도 사용할 수 있도록 확장할 계획이라고 합니다.)
+ Vertex AI는 텍스트로 이미지를 생성하는 도구로 구글 클라우드에서 제공하는 AI 및 머신러닝 개발 및 배포 플랫폼입니다.

이 워터마크는 이미지 압축 손실에 영향을 미치지 않으며, 이미지에서 육안으로 확인되지 않는 디지털 워터마크입니다. 즉, 필터, 색상 변경 등의 이미지 변화 후에도 초기 이미지 생성이 AI에 의한 것인지 여부를 확인할 수 있습니다.  
그럼 이 워터마크 어떻게 생성되고 이미지에 적용되었길래 보이지 않지만 식별이 가능하게 만들어진 걸까요?

### 디지털 워터마크의 원리
SynthID의 워터마크는 이미지의 픽셀에 직접 추가하여 인간의 눈으로는 관찰할 수 없도록 만드는 동시에 전문 AI 식별 알고리즘으로는 감지할 수 있도록 합니다. 두 개의 AI 모델을 사용해서 하나는 눈에 띄지 않는 워터마크를 추가하는 데 사용되고, 다른 하나는 이를 식별하는 데 사용됩니다.
SynthID AI 모델의 원리에 대한 구체적인 내용은 아직 베타버전이고 보안 이슈라서 자세히 나와있지 않습니다.

대신에 OpenStego의 원리를 통해 어떤 방식들이 사용될 수 있는지 확인해 볼 수 있지 않을까라는 생각이 들어 찾아보게 되었습니다.  
먼저, Steganography는 이미지, 비디오 등 컨텐츠에 메시지를 감추는 것을 말합니다. 이미지 일부분을 딥러닝 모델로 변경시키고 거의 원본 이미지와 유사하게 만들고 변경된 인코딩 정보를 이미지에 숨기는 방식입니다. 여기서 이미지의 변경은 픽셀의 일부 변경, 색상 값의 조정 등의 방식을 말합니다.  
OpenStego는 모든 이미지 형식을 지원하며 이미지 특성과 시각적 변경이 없는 Steganography 툴입니다. 원하는 알고리즘과 비밀번호를 선택해 자신의 보안 요구 사항에 맞게 설정할 수 있습니다.  
실제 OpenStego는 이미지 워터마크 처리를 위해 DCT(Discrete Cosine Transform) 기반의 ```DctLSBPlugin``` 그리고 DWT(Discrete Wavelet Transform) 기반의 ```DWTDugadPlugin```, ```DWTKimPlugin```, ```DWTXiePlugin```을 가지고 있는 플러그인 기반 아키텍처로 구성되어 있습니다.
여기서 각 알고리즘은 Peter Meerwald의 코드를 사용했으며 이 분이 작성한 각 알고리즘을 적용한 이미지 사이트 에서 확인해 볼 수 있습니다.

잠깐 DCT와 DWT에 대한 개념을 정리하고 가겠습니다 :)

#### DCT와 DWT
DCT는 주로 주파수 도메인 표현 및 데이터 손실 압축에 사용되고, DWT는 다중 해상도 표현 및 데이터 손실 최소화에 사용됩니다.  
DCT는 이미지를 작은 조각으로 나누어 색상 정보를 사용하여 숫자를 만들고, DWT는 이미지를 작은 조각으로 나누어 세부 정보를 사용하여 이미지를 만듭니다. 여기서 색상 정보는 조각 안의 색조, 채도 및 명도와 같은 것을 의미하고 세부 정보는 이미지의 고주파수 성분(이미지에서 작은 세부 사항, 엣지 (이미지 내의 뾰족한 변화), 텍스처 (균일하지 않은 패턴), 노이즈)을 의미합니다.

그럼 다시 위에 DWTXiePlugin 중 워터마크를 이미지에 삽입하는 과정을 살펴보겠습니다. (```DWTXiePlugin``` ```embedData``` 메서드 살펴보기)
```java
public byte[] embedData(byte[] msg, String msgFileName, byte[] cover, String coverFileName, String stegoFileName) throws OpenStegoException {
// ...

    // Cover file is mandatory
    if (cover == null) {
        throw new OpenStegoException(null, NAMESPACE, DWTXieErrors.ERR_NO_COVER_FILE);
    } else {
        image = ImageUtil.byteArrayToImage(cover, coverFileName);
    }

    // ...

    // Wavelet transform
    dwt = new DWT(cols, rows, sig.filterID, sig.embeddingLevel, sig.waveletFilterMethod);
    dwtTree = dwt.forwardDWT(luminance);

    p = dwtTree;
    // Consider each resolution level
    while (p.getLevel() < sig.embeddingLevel) {
        // Descend one level
        p = p.getCoarse();
    }

    // Repeat binary watermark by sliding a 3-pixel window of approximation image
    for (int row = 0; row < p.getImage().getHeight(); row++) {
        for (int col = 0; col < p.getImage().getWidth() - 3; col += 3) {
            // Get all three approximation pixels in window
            pixel1 = new Pixel(0, DWTUtil.getPixel(p.getImage(), col, row));
            pixel2 = new Pixel(1, DWTUtil.getPixel(p.getImage(), col + 1, row));
            pixel3 = new Pixel(2, DWTUtil.getPixel(p.getImage(), col + 2, row));

            // Bring selected pixels in ascending order
            if (pixel1.value > pixel2.value) {
                swapPix(pixel1, pixel2);
            }
            if (pixel2.value > pixel3.value) {
                swapPix(pixel2, pixel3);
            }
            if (pixel1.value > pixel2.value) {
                swapPix(pixel1, pixel2);
            }

            // Apply watermarking transformation (modify median pixel)
            temp = wmTransform(sig.embeddingStrength, pixel1.value, pixel2.value, pixel3.value,
                    getWatermarkBit(sig.watermark, n % (sig.watermarkLength * 8)));

            // Write modified pixel
            DWTUtil.setPixel(p.getImage(), col + pixel2.pos, row, temp);

            n++;
        }
    }

    // ...

    return ImageUtil.imageToByteArray(image, stegoFileName, this);
}
```

코드를 요약하면,  
cover image를 DWT로 다양한 해상도 레벨로 분해합니다. 그리고 각 픽셀 그룹에서 세 개의 근사화된 픽셀 값을 가져오고 이를 정렬합니다. 워터마크 변환을 적용하여 중간 픽셀을 수정하고, 수정된 값을 이미지에 쓰기 위해 ```DWTUtil.setPixel```을 호출합니다.  
마지막으로 워터마크가 적용된 이미지를 생성한 뒤, 바이트 배열로 변환해서 반환합니다.

조금 더 세분화해서 의미를 살펴보자면,
DWT는 이미지를 다음과 같이 다른 레벨의 근사화 이미지와 세부 성분 이미지로 분해합니다. 워터마크를 세부 성분 이미지에 숨기면 이미지의 고주파 성분에 영향을 미칠 수 있으며, 이로 인해 이미지 품질이 손상될 수 있습니다. 그래서 보통 근사화 이미지의 픽셀 그룹을 선택하게 됩니다.  
픽셀그룹은 세 개의 연속된 픽셀을 말하며, 그 중에서 밝기가 가장 낮은 픽셀을 찾아 워터마크 데이터의 비트에 따라 수정합니다. 픽셀 그룹을 선택하고 가장 낮은 픽셀을 수정하는 이유는 이미지의 세부한 부분을 변경하지 않으면서 워터마크를 더 효과적으로 숨기기 위함입니다. 이렇게 함으로써 워터마크가 이미지에 미세한 변화를 일으키지만, 인간 눈으로는 감지하기 어렵게 만듭니다.

### AI 이미지 디지털 워터마크와 미래
AI 컨텐츠의 발전과 더불어 구글, 아마, 오픈AI를 비롯한 7개 업체들의 이용자 안전 조치에 대한 자발적 합의를 시작으로 점차 AI 컨텐츠에 대한 구별과 규제가 중요해지고 있습니다.
SynthID와 같은 기술들은 육안으로 구분이 되지 않는 디지털 워터마크로 인해 잘못된 정보 또는 실제 사람의 흉내를 내는 등의 딥페이크 이미지 구분이 가능해집니다.
의미있는 저작권에 대한 진전이라고 보는 긍정적인 시각과 여전히 지금 이 기술로는 장기적 효용성에 대한 한계가 있다는 회의적인 의견이 공존하고 있습니다.

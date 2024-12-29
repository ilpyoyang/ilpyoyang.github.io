---
title: 지도학습
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [AI]
tags: [지도학습]
pin: false
math: true
mermaid: true
---

### 베이스 모델
성능 측정의 기준이 되는 모델로 참조 지점으로 사용되는 단순한 모델 또는 휴리스틱을 말합니다. 머신러닝 모델이 의미있게 하는 가장 최소한의 성능을 제공하는 모델입니다.  
참고로 <span style="background-color:#fff5b1">휴리스틱이란, 시간이나 정보가 불충분해 합리적인 판단을 할 수 없거나 체계적이고 합리적인 판단이 필요없는 경우 신속하게 사용하는 어림짐작의 기술</span>입니다.

### 분류  
예측해야할 대상의 개수가 정해져 있는 문제를 말합니다. 예를 들어, 동물의 분류거나 이진 분류 값을 원하는 문제가 해당됩니다.

<span style="background-color:#fff5b1">Confusion Matrix, 오차행렬</span>이란 Traning을 통한 Prediction 성능을 측정하기 위해 예측값과 실제값을 비교하기 위한 표입니다. 여기서 ```True/False```는 관심 범주의 여부를 의미하고 ```Positive/Negative```는 분류를 제대로 했는지 여부를 의미한다. 이 정보를 바탕으로 ```Accuracy```, ```Parecision```, ```Recall``` 3가지 척도를 평가할 수 있습니다.
1. <span style="background-color:#FFE6E6">Accuracy, 정확도</span>  
   ```(TP + TN) / (TP + TN + FP + FN)```  
   모델이 얼마나 정확한지를 파악하는 척도를 말합니다. 하지만 불균형 데이터에 사용하기는 부적합합니다. 예를 들어, 정확도는 높게 나오더라도 실제 검출해야 하는 값을 예측하지 못할 수 있기 때문입니다.
2. <span style="background-color:#FFE6E6">Precision, 정밀도</span>  
   ```TP / (TP + FP)```  
   Negative인 데이터가 중요할 때, 이 데이터를 Positive로 판단하면 안 될 때 사용됩니다. 예를 들어, 스팸메일을 일반메일로 분류하면 안되는 경우에 해당합니다.
3. <span style="background-color:#FFE6E6">Recall, 재현도</span>  
   ```TP / (TP + FN)```  
   ```Precision```과 반대로 Positive인 데이터를 Negative로 판단하면 안되는 경우에 중요합니다. 관심 영역만을 얼마나 추출해냈는지를 말합니다.
4. <span style="background-color:#FFE6E6">ROC(Receiver Operating Characteristic), 수신자 조작 특성</span>  
   제대로 판단하는 비율인 ```TRR(True Positive Rate)```를 y축으로 하고, 잘못 판단하는 비율인 ```FPR(False Positive Rate)```를 x축으로 하는 그래프를 말합니다. 즉, 곡선은 ```(0,0)```과 ```(1,1)```을 잇는 직선에서 ```(0,1)``` 지점으로 치우친 그래프를 갖는 모델이 가장 높은 성능을 보이는 모델임을 알 수 있습니다.
5. <span style="background-color:#FFE6E6">AUC(Area Under Curve)</span>    
   ROC 곡선의 아래 curve의 밑면적으로 0~1 사이의 값을 갖습니다. 1에 가까울수록 예측을 잘하는 모델이라고 할 수 있습니다.

### 회귀
예측해야할 대상이 <span style="background-color:#fff5b1">연속적인 숫자</span>인 문제를 말합니다. 주어진 데이터를 가지고 날씨나 부동산 시세를 예측하는 것을 회귀의 예로 들 수 있습니다.

---
[Confusion Matrix를 통한 분류 모델의 평가](https://yamalab.tistory.com/50)  
[Visualize Confusion Matrix Using Caret Package in R](https://www.geeksforgeeks.org/visualize-confusion-matrix-using-caret-package-in-r/)  
[[용어 설명] ROC curve와 AUC란?](https://bioinfoblog.tistory.com/221)

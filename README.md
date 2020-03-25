# SARS-CoV-2 Diagnose Tool
Diagnose SARS-CoV-2 from Chest X-Ray Images

# Introduction 

# Data Availablity
Data is so important for Machine Learning based tasks. The data that we feed the deep learning model is currently largest public medical image dataset about COVID-19 which is Joseph Paul Cohen's covid-chestxray-dataset [[0]](https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool#References). Also we use CheXpert Dataset [[1]](https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool#References) and concatenate with covid-chestxray-dataset. 

# Installation

- Download the Repository and Get In.
```
$ git clone https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool.git
$ cd SARS-CoV-2-Diagnose-Tool
```
- Create Anaconda Environment and Install Dependecies
```
$ conda create -n covid19-diagnose-tool python=3.6
$ conda activate covid19-diagnose-tool
$ pip install -r requirements.txt
```
```
# Get access to libraries in conda environment from Jupyter Notebook
$ conda install nb_conda 
```

- Activate the Anaconda Environment 
```
$ conda activate covid19-diagnose-tool
```

- Download and Replace Data
- - Download and Extract CheXpert-v1.0-small from https://stanfordmlgroup.github.io/competitions/chexpert/ to "data" folder (data/CheXpert-v1.0-small) 

- - Download and Extract "covid-chestxray-dataset" via "data/get_covid-chestxray-dataset.sh" 

<b><i> Ready to work with.</i></b>

# Technical Details

## Stratified Train/Val/Test Split and Oversampling
- The dataset has imbalanced classes. So, it may cause overfitting problem. To prevent overfitting problem we use stratification for splitting data. This allows to protect class frequencies while splitting data. 

- Also we apply 10X oversampling to covid-chestxray-dataset's seperated training dataset. 

<i>With this preventions we trying to reduce impacts of class imbalance.</i>
<img src="assets/train_val_test_split_scheme.png"></img>

## Data Augmentation & Normalization
These Data Augmentation Techniques were used:
- HorizontalFlip
- CLAHE
- RandomBrightnessContrast
- ShiftScaleRotate

### Light & Hard Data Augmentation 
We use hard data augmentation to increase variety of oversampled data. Light data augmentation applied to remaining data.
Only difference between Light-Hard data augmentation is probability and limits but used same data augmentation techniques.

## Model
- We used BreastNet model. For More Information: [[2]](https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool#References)
<p align="center"><a href="https://drive.google.com/uc?export=view&id=XXX"><img src="https://drive.google.com/uc?export=view&id=1r5H6v7r3Flwhx4Q5SkEr4NcNeM73c99o" style="width: 500px; max-width: 100%; height: auto" title="Click for the larger version." /></a></p>

</p>

## Training Pipeline
- Firstly we've train model for 2 epochs to find optimal learning rate. We choose the learning rate according to have most gradient (Not to minimum loss) (2e-4 selected as lr). 

<p align="center"><img src="assets/optimal_lr.JPG" width="450" height="300"></img></p>

- We've warm-up model with this decided learning rate for 5 epochs.

Warm-Up Training Loss Graph | Warm-Up Training AUC Graph 
:-------------------------:|:-------------------------:
<img src="results/MODEL LOSS - warmup - .jpg"></img>  |  <img src="results/MODEL AUC SCORE - warmup - .jpg"></img>

- Train the model with SGDR (Stochastic Gradient Descent with Restarts) Learning Rate Schedule for 100 epochs. (Epoch 52: Early Stopped)

Training Loss Graph | Training AUC Graph 
:-------------------------:|:-------------------------:
<img src="results/MODEL LOSS - fit - .jpg"></img>  |  <img src="results/MODEL AUC SCORE - fit - .jpg"></img>


# Results
### Just Coronavirus Test Data Results
|Metrics | Scores|
---------|-------- |
|           ROC_AUC          | 0.937 |
|           Accuracy         | 0.883 |
|           F1_Score         | 0.883 |
|           Precision        | 0.883 |
|           Recall           | 0.883 |


```

              precision    recall  f1-score   support

           0       0.94      0.94      0.94        53 # SARS-CoV-2 
           1       0.00      0.00      0.00         2 # ARDS
           2       0.75      0.60      0.67         5 # SARS
           3       0.00      0.00      0.00         0
           4       0.00      0.00      0.00         0
           5       0.00      0.00      0.00         0
           6       0.00      0.00      0.00         0
           7       0.00      0.00      0.00         0
           8       0.00      0.00      0.00         0
           9       0.00      0.00      0.00         0
          10       0.00      0.00      0.00         0
          11       0.00      0.00      0.00         0
          12       0.00      0.00      0.00         0
          13       0.00      0.00      0.00         0
          14       0.00      0.00      0.00         0
          15       0.00      0.00      0.00         0

   micro avg       0.88      0.88      0.88        60
   macro avg       0.11      0.10      0.10        60
weighted avg       0.90      0.88      0.89        60
 samples avg       0.88      0.88      0.88        60

```

### All Test Data Together Results
|Metrics | Scores|
---------|-------- |
|           ROC_AUC          | 0.671 |
|           Accuracy         | 0.201 |
|           F1_Score         | 0.437 |
|           Precision        | 0.625 |
|           Recall           | 0.368 |

```
              precision    recall  f1-score   support

           0       0.91      0.94      0.93        53 # SARS-CoV-2
           1       0.00      0.00      0.00         2 # ARDS
           2       0.75      0.60      0.67         5 # SARS
           3       0.51      0.73      0.60      4454 # No-Finding
           4       0.00      0.00      0.00      1421 # Enlarged Cardiom.
           5       0.58      0.19      0.28      3576 # Cardiomegaly
           6       0.52      0.18      0.27     10643 # Lung Lesion
           7       0.00      0.00      0.00      1133 # Lung Opacity
           8       0.64      0.28      0.39      7129 # Edema
           9       0.00      0.00      0.00      1720 # Consolidation
          10       0.00      0.00      0.00       757 # Pneumonia
          11       0.37      0.03      0.05      4751 # Atelectasis
          12       0.57      0.19      0.28      2989 # Pneumothorax
          13       0.74      0.71      0.73     11163 # Pleural Effusion
          14       0.00      0.00      0.00       404 # Pleural Other
          15       0.00      0.00      0.00      1209 # Fracture

   micro avg       0.63      0.32      0.43     51409
   macro avg       0.35      0.24      0.26     51409
weighted avg       0.51      0.32      0.36     51409
 samples avg       0.63      0.37      0.44     51409
```

### Converted Binary Classification of SARS-CoV-2
|Metrics | Scores|
---------|-------- |
|           ROC_AUC          | 0.971 |
|           Accuracy         | 0.999 |
|           F1_Score         | 0.925 |
|           Precision        | 0.909 |
|           Recall           | 0.943 |

<hr>


Confusion Matrix For Converted Binary Classification of SARS-CoV-2| 
:-------------------------:|
|<img src="results/Confusion Matrix - Binary SARS-CoV-2 Classification.jpg"> |



# Contribute
All contributions are welcomed. Please see <a href="CONTRIBUTING.md">CONTRIBUTING.md</a>

# References

[0]  
```
@inproceedings{irvin2019chexpert,
  title={CheXpert: A large chest radiograph dataset with uncertainty labels and expert comparison},
  author={Irvin, Jeremy and Rajpurkar, Pranav and Ko, Michael and Yu, Yifan and Ciurea-Ilcus, Silviana and Chute, Chris and Marklund, Henrik and Haghgoo, Behzad and Ball, Robyn and Shpanskaya, Katie and others},
  booktitle={Thirty-Third AAAI Conference on Artificial Intelligence},
  year={2019}
}
```
[1]
```
@article{cohen2020covid,
  title={COVID-19 image data collection},
  author={Joseph Paul Cohen},
  journal={https://github.com/ieee8023/covid-chestxray-dataset},
  year={2020}
}
```
[2]
```
M. Togaçar, K.B. Özkurt, B. Ergen et al., BreastNet: A novel ˘
convolutional neural network model through histopathological images for the diagnosis of breast
cancer, Physica A (2019), doi: https://doi.org/10.1016/j.physa.2019.123592.
```

[3]
```
https://course.fast.ai/
```



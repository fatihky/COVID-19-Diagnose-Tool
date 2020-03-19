# COVID19-Diagnose-Tool
Diagnose COVID-19 Disease from Chest X-Ray/CT Images

# Introduction 

# Installation

- Download the Repository and Get In.
```
$ git clone https://github.com/Goodsea/COVID19-Diagnose-Tool.git
$ cd COVID19-Diagnose-Tool
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
<b><i> Ready to work with.</i></b>

# Data Availablity
Data is so important for Machine Learning based tasks. The data that we feed the deep learning model is currently largest public medical image dataset about COVID-19 which is <a href="https://josephpcohen.com/w/">Joseph Paul Cohen's</a> <a href="https://github.com/ieee8023/covid-chestxray-dataset">covid-chestxray-dataset</a>

# Technical Details
## Data Augmentation  
<a href="https://github.com/ieee8023/covid-chestxray-dataset">covid-chestxray-dataset</a> is the largest public medical image dataset about COVID-19 but still it's data size is not enough for deep learning models to get reliable results. What I mean by reliable results is that the model does not undergo overfitting. If we get nice results with true metrics in training but bad results in test set, this will shows that our algorithm doesn't work properly. So to prevent this, we think to apply data augmentation. But there is another problem with data: Class Imbalance. There is much more data with "COVID-19" label than others. This may cause to overfitting, too. 

Data Augmentation (DA) process works random with pre-defined probabilities. If we give higher probabilities to DA function, this will increase the probabilities of apply the DA function to data. So our solution to solve this problem is use low DA probabilities for COVID-19 cases and use high for others. 

## Stratified K-Fold and Iteratively Stratified Train/Test Split
We split whole data mainly into 3 chunks: [Training-Validation]-[Testing] Because we need to detect that if model undergoes overfitting. Firstly, with iterative_train_test_split function we split data into "USED-FOR-TRAINING_DATA" and "USED-FOR-TESTING_DATA" as 50% - 50%. (Give higher rates as much as possible for "USED-FOR-TESTING_DATA" rate. Thus, we can trust more to our results.) 

But why we didn't use simple train_test_split function? Some classes ('No Finding', 'Pneumocystis') in dataset have just 2 datas. If we apply train_test_split function, probably we can't see the how model performs classification for those classes, well. Because it splits data randomized. But iterative_train_test_split function splits data according to class-balance. And for the same related reasons we use Stratified K-Fold than K-Fold. K=3 were used.

## Learning Rate Scheduler

## Model


# Results


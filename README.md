# SARS-CoV-2 Diagnose Tool
Diagnose SARS-CoV-2 from Chest X-Ray Images

# Introduction 

# Data Availablity
Data is so important for Machine Learning based tasks. The data that we feed the deep learning model is currently largest public medical image dataset about COVID-19 which is Joseph Paul Cohen's <a href="https://github.com/ieee8023/covid-chestxray-dataset">covid-chestxray-dataset</a> [[0]](https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool#References). Also we use CheXpert Dataset [[1]](https://github.com/Goodsea/SARS-CoV-2-Diagnose-Tool#References) and concatenate with covid-chestxray-dataset. 

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

## Data Augmentation 
## Stratified Train/Val/Test Split
## Learning Rate
## Model


# Results

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


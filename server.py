import os
from flask import Flask, json, flash, request, redirect, url_for
from werkzeug.utils import secure_filename

import cv2
import numpy as np

import tensorflow as tf 
from tensorflow.keras.models import load_model

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

companies = [{"id": 1, "name": "Company One"}, {"id": 2, "name": "Company Two"}]

api = Flask(__name__)

api.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# prediction
def preprocess_img(path, SHAPE=(224,224,3)):
	img = cv2.imread(path)
	img = cv2.resize(img, SHAPE[:2])
	img = np.divide(img, 255)
	return img 

def get_images(paths):
	img_batch = []
	for path in paths:
		img = preprocess_img(path)
		img_batch.append(img)
	return np.array(img_batch)

def get_predictions(model, img_batch):
	with tf.device('/cpu:0'):
		prediction_batch = model.predict(img_batch)
	return prediction_batch	

def map_predictions2labels(predictions, classes = ["SARS-CoV-2", "ARDS","SARS","No-Finding",
													"Enlarged Cardiom.","Cardiomegaly",	"Lung Lesion",
													"Lung Opacity","Edema","Consolidation","Pneumonia",
													"Atelectasis", "Pneumothorax","Pleural Effusion",
													"Pleural Other","Fracture"]):

	label_dicts = []
	for pred in predictions:
		label_dict = dict()
		for i, cls in enumerate(classes):
			label_dict[cls] = pred[i]
		label_dicts.append(label_dict)

	return label_dicts

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

# file uploading helper
def allowed_file(filename):
  return '.' in filename and \
    filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route('/predict', methods=['POST'])
def predict():
  # check if the post request has the file part
  if 'file' not in request.files:
    return json.dumps({ "error": "no file" })

  file = request.files['file']

  if file.filename == '':
    return json.dumps({ "error": "no file" })

  if file and allowed_file(file.filename):
    filename = secure_filename(file.filename)
    file.save(os.path.join(api.config['UPLOAD_FOLDER'], filename))
    print("uploaded file path:")
    print(os.path.join(api.config['UPLOAD_FOLDER'], filename))

    path = os.path.join(api.config['UPLOAD_FOLDER'], filename)

    # [START PREDICTION]
    with tf.device('/cpu:0'):
      model = load_model("models/CORONA_DIAGNOSE_MODEL.h5")

    paths = [path]
    img_batch = get_images(paths)

    predictions = get_predictions(model, img_batch)
    print(predictions)
    pred_label_dicts = map_predictions2labels(predictions)
    print(pred_label_dicts)

    # This will be sent back to the ui
    result = {
      "predictions": predictions,
      "pred_label_dicts": pred_label_dicts
    }
    # [END PREDICTION]

    return json.dumps(result, cls=NumpyEncoder)
  else:
    return json.dumps({ "error": "no allowed files specified" })

if __name__ == '__main__':
    api.run()

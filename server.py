import os
from flask import Flask, json, flash, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename

import cv2
import base64
import numpy as np

import tensorflow as tf 
from gradcam import GradCAM
from tensorflow.keras.models import load_model

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

api = Flask(__name__, static_folder='web-ui/build')

api.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

device = "/cpu:0" # "/cpu:0"
with tf.device(device):
  model = load_model("models/CORONA_DIAGNOSE_MODEL.h5")
  print(model.summary())

# prediction
def preprocess_img(img, SHAPE=(224,224,3)):
	img = cv2.resize(img, SHAPE[:2])
	img = np.divide(img, 255)
	return img 

def get_images(paths):
	img_batch = []
	img_origs = []
	for path in paths:
		img_orig = cv2.imread(path)
		img = preprocess_img(img_orig)
		img_batch.append(img)
		img_origs.append(img_orig)
	return np.array(img_batch), np.array(img_origs)

def get_predictions(model, img_batch):
	with tf.device(device):
		prediction_batch = model.predict(img_batch)
	return prediction_batch	

def map_predictions(paths, predictions, heatmaps, classes = ["SARS-CoV-2", "ARDS","SARS","No-Finding",
												      	     "Enlarged Cardiom.","Cardiomegaly", "Lung Lesion",
													  		 "Lung Opacity","Edema","Consolidation","Pneumonia",
													  		 "Atelectasis", "Pneumothorax","Pleural Effusion",
													  		 "Pleural Other","Fracture"]):

    result = []

    for ix in range(predictions.shape[0]):
        res41img = []
        for cx in range(len(classes)):
            res_template = dict({"disease": classes[cx], "prediction": predictions[ix][cx], "heatmapBase64": heatmaps[ix][cx]})
            res41img.append(res_template)
        result.append(dict({"path": paths[ix], "data": res41img}))
    
    return result

def gradcam(model, img_orig, img_b, pred, conf, label_max):
    img_encs = []
    for lbl_index in range(label_max):
        if pred[lbl_index]>conf:
            cam = GradCAM(model, lbl_index)
            heatmap = cam.compute_heatmap(np.array([img_b]))

            heatmap = cv2.resize(heatmap, (img_orig.shape[1], img_orig.shape[0]))
            (heatmap, output) = cam.overlay_heatmap(heatmap, img_orig, alpha=0.5)

            _, out_enc = cv2.imencode(".jpg", output)
            out_enc = base64.b64encode(out_enc).decode('ascii')
            img_encs.append(out_enc)
        else:
        	img_encs.append(None)
    return img_encs

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
    files = request.files.getlist("file")
    
    paths = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(api.config['UPLOAD_FOLDER'], filename))
            path = os.path.join(api.config['UPLOAD_FOLDER'], filename)
            paths.append(path)

    if len(paths)==0:
    	return json.dumps({ "error": "no allowed files specified" })

    img_batch, img_origs = get_images(paths)

    predictions = get_predictions(model, img_batch).astype(float)

    heatmaps = []
    for k in range(len(img_batch)):
        heatmaps.append(gradcam(model, img_origs[k], img_batch[k], predictions[k], 0.5, 16))

    # This will be sent back to the ui
    result = map_predictions(paths, predictions, heatmaps)
    # [END PREDICTION]

    return json.dumps(result, cls=NumpyEncoder)
  

# Serve React App
@api.route('/', defaults={'path': ''})
@api.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(api.static_folder + '/' + path):
        return send_from_directory(api.static_folder, path)
    else:
        return send_from_directory(api.static_folder, 'index.html')

if __name__ == '__main__':
    api.run()

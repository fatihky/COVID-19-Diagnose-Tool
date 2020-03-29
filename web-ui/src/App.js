import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Row, Divider, Modal } from 'antd';
import { useDropzone } from 'react-dropzone'

import logo from './logo.jpg'

const ENDPOINT = '/predict'

function App() {
  const [state, setState] = useState(() => ({ images: [], files: [], results: [] }))
  const [modalState, setModalState] = useState(() => ({ visible: false, image: null }))
  const onDrop = useCallback(acceptedFiles => {
    console.log('on drop:', { acceptedFiles })

    Promise.all(acceptedFiles.map(async file => {  
      return new Promise((resolve) => {
        const fr = new FileReader()
        
        
        fr.onload = function () {
          resolve(this.result)
        }
        
        fr.readAsDataURL(file)
      })
    }))
      .then(images => {
        console.log('images:', images)

        setState({
          ...state,
          files: acceptedFiles,
          images
        })
      })
  }, [ state, setState ])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop })
  const uploadFiles = useCallback(() => {
    const formData = new FormData();

    state.files.forEach(file => formData.append('file[]', file, file.name))

    console.log('formData:', formData)

    fetch(ENDPOINT, {
      method: "POST",
      body: formData
    })
      .then(result => result.json())
      .then(result => {
        console.log(result)

        if (result.error) {
          return alert(result.error)
        }

        setState({
          ...state,
          results: result
        })
      })
      .catch(err => {
        console.log('fetch error:', err)
      })
    ;
  }, [ state, setState ])
  const onImageClick = useCallback((image) => {
    setModalState({
      visible: true,
      image
    })
  }, [ setModalState ])
  const closePreviewModal = useCallback(() => {
    setModalState({
      ...modalState,
      visible: false
    })
  }, [modalState, setModalState])

  console.log(state)

  return (
    <div style={{ textAlign: 'center' }}>
      <Modal
        title='Image Preview (use "right click > Save image as ..." to view original size)'
        visible={modalState.visible}
        width="99%"
        onCancel={closePreviewModal}
        onOk={closePreviewModal}
      >
        {modalState.image && <img src={modalState.image} alt="Big" style={{ maxWidth: '100%' }} />}
      </Modal>

      <Row>
        <Col span={24}>
          <img src={logo} style={{ width: '15em' }} alt="logo" />
        </Col>
      </Row>

      {/* Test Images and Result Images */}
      <Row>
        {/* Titles */}
        <Col span={12}>
          <h2>Test Images</h2>
        </Col>

        <Col span={12}>
          <h2>Result Images</h2>
        </Col>
        <Divider/>
        {/* / Titles */}

        {/* display a Row for each image */}
        {/* <Row key={`${state.files[i].name}-${state.files[i].size}`}> */}
        <Row gutter={[20, 20]}>
          {state.images.map((image, i) => (
            <Col span={24} key={`${state.files[i].name}-${state.files[i].size}`}>
              <Row>
                <Col span={12}>
                  <header>
                    <h2>Image {i + 1}</h2><span>({state.files[i].name})</span>
                  </header>
                  <span style={{ cursor: 'pointer' }} onClick={() => onImageClick(image)}>
                    <img src={image} alt="Test" style={{ margin: 'auto', maxWidth: '50%' }} />
                  </span>
                </Col>

                <Col span={12}>
                  <Row>
                    <Col span={24}>
                      <h2>Results</h2>
                    </Col>
                    {state.results[i] && state.results[i].data.map(result => (
                      <Col span={12}>
                        <Card
                          hoverable={true}
                          onClick={() => result.heatmapBase64 && onImageClick(result.heatmapBase64)}
                        >
                          <h3>{result.disease}</h3>
                          <span>Prediction: {result.prediction}</span>
                          <br/>
                          {result.heatmapBase64 && <span>
                            <img src={result.heatmapBase64} alt={`Result for ${result.disease}`} style={{ margin: 'auto', maxWidth: '80%' }} />
                          </span>}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              <Divider/>
            </Col>
          ))}
        </Row>
      </Row>
      {/* / Test Images and Result Images */}

      <Row>
        <Col span={12}>
          <Divider/>
          <Row>
            <Col offset={5} span={14}>
              <Card {...getRootProps()} style={{ borderColor: 'pink', borderWidth: '0.2em' }}>
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>Drop the test images here ...</p> :
                    <p>Drag 'n' drop test images here, or click to select images</p>
                }
              </Card>
            </Col>
          </Row>
          <Row style={{ marginTop: '1em' }}>
            <Col offset={7} span={10}>
              <Button onClick={uploadFiles} disabled={state.files.length === 0}>
                Upload
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

    </div>
  );
}

export default App;

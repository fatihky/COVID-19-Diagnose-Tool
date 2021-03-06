import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Row, Divider, Modal } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useDropzone } from 'react-dropzone'

import logo from './logo.jpg'

const ENDPOINT = '/predict'

function App() {
  const [state, setState] = useState(() => ({ images: [], files: [], results: [], loading: false }))
  const [modalState, setModalState] = useState(() => ({ visible: false, image: null, addPrefix: true }))
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
          results: [], // reset results
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

    // set loading
    setState({ ...state, loading: true })

    fetch(ENDPOINT, {
      method: "POST",
      body: formData
    })
      .then(result => result.json())
      .then(result => {
        console.log(result)

        if (result.error) {
          setState({ ...state, loading: false })
          return alert(result.error)
        }

        setState({
          ...state,
          loading: false,
          results: result
        })
      })
      .catch(err => {
        console.log('fetch error:', err)
        alert('Error: ' + err.message)
        // set loading
        setState({ ...state, loading: false })
      })
    ;
  }, [ state, setState ])
  const onImageClick = useCallback((image, addPrefix = true) => {
    setModalState({
      visible: true,
      image,
      addPrefix
    })
  }, [ setModalState ])
  const closePreviewModal = useCallback(() => {
    setModalState({
      ...modalState,
      visible: false
    })
  }, [modalState, setModalState])
  const scrollToTop = useCallback(() => document.getElementById('top').scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToBottom = useCallback(() => document.getElementById('bottom').scrollIntoView({ behavior: 'smooth' }), [])

  console.log(state)

  return (
    <div id="top" style={{ textAlign: 'center' }}>
      {/* Image Preview Modal */}
      <Modal
        title='Image Preview (use "right click > Save image as ..." to view original size)'
        visible={modalState.visible}
        width="99%"
        style={{ top: "10px" }}
        onCancel={closePreviewModal}
        onOk={closePreviewModal}
      >
        {modalState.image && <img src={`${modalState.addPrefix ? 'data:image/png;base64,' : ''}${modalState.image}`} alt="Big" style={{ maxWidth: '100%' }} />}
      </Modal>

      {/* Scroll to Bottom Button */}
      <Button type="primary" icon={<UpOutlined />} size='large' onClick={scrollToTop} style={{ position: 'fixed', bottom: '3.5em', right: '1em', zIndex: '9999' }} />
      <Button type="primary" icon={<DownOutlined />} size='large' onClick={scrollToBottom} style={{ position: 'fixed', bottom: '1em', right: '1em', zIndex: '9999' }} />

      {/* Logo */}
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
        <Col span={24}>
          <Row gutter={[20, 20]}>
            {state.images.map((image, i) => (
              <Col span={24} key={`${state.files[i].name}-${state.files[i].size}`}>
                <Row>
                  <Col span={12}>
                    <header>
                      <h2>Image {i + 1}</h2><span>({state.files[i].name})</span>
                    </header>
                    <span style={{ cursor: 'pointer' }} onClick={() => onImageClick(image, false)}>
                      <img src={image} alt="Test" style={{ margin: 'auto', maxWidth: '50%' }} />
                    </span>
                  </Col>

                  <Col span={12}>
                    <Row>
                      <Col span={24}>
                        <h2>Result {i + 1}</h2>
                        {state.loading && <span>Loading...</span>}
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
                              <img src={`data:image/png;base64,${result.heatmapBase64}`} alt={`Result for ${result.disease}`} style={{ margin: 'auto', maxWidth: '80%' }} />
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
        </Col>

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

      <div id="bottom" />
    </div>
  );
}

export default App;

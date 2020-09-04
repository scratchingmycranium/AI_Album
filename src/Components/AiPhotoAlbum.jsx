import React, { useState } from 'react';
import 'antd/dist/antd.css';
import axios from "axios"
import { Upload, Progress, notification, Spin, Row, Col, Divider  } from 'antd';
import { PlusOutlined, AudioOutlined } from '../../node_modules/@ant-design/icons';
import './AiPhotoAlbum.css'
import Search from 'antd/lib/input/Search';

const PhotoAlbum = () => {
  console.log("--------new state---------")
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [searchHeader,setSearchHeader] = useState('')

  // Process image - rename to current date for unique filename
  const processImage = async (file) =>{
    var date = Date.now()

    // extract the filetype
    let fileParts = file.name.split('.');
    let fileType = fileParts.pop();

    var newName = date + "." + fileType

    return new File([file], newName, {
        type: file.type,
        lastModified: file.lastModified,
    });
  }

  // Upload image
  const uploadImage = async options => {
    const { onSuccess, onError, file, onProgress } = options;
    const img = await processImage(file)
    
    // Generate a signedURL for uploading the image to the S3 bucket. Invokes a Lambda Function in AWS
    const signedS3Put = await axios.get(
      "https://dgtpgsb4ne.execute-api.us-east-1.amazonaws.com/dev/get-s3-upload-url?bucket=b2-hw3&key="+img.name+"&filetype="+img.type
    )
    

    const config = {
      headers: { "Content-Type": img.type },
      onUploadProgress: event => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress({ percent: (event.loaded / event.total) * 100 });
      }
    };

    // Uploads the image using the signedURL
    try {
      const res = await axios.put(
        signedS3Put.data,
        img,
        config
      );
      onSuccess("Ok");

    } catch (err) {
      const error = new Error("An error!");
      onError({ err });
    }
  };

  // Updats react hook with input from field
  const searchHandler = (event) => {
    setSearchTerm(event.target.value)
  }

  // Handles the search
  const handleSearch = (e) => {
    // Check if submit without input
    if(searchTerm.length<1) return null;

    setIsLoading(true)
    setPhotos([])
    setSearchHeader(searchTerm)

    try{
      // Make GET to API Gateway with searchTerm, returns an array of image URLs
      const res = axios.get(
        "https://dgtpgsb4ne.execute-api.us-east-1.amazonaws.com/dev/search?q="+searchTerm,
      ).then((res) => {
        var photoArray = []
        res.data.results.forEach(result => {
          photoArray.push(result.imageUrl)
        })
        setPhotos(photoArray)
        setIsLoading(false)

        // If the returned array is empty, trigger alert
        if(photoArray.length < 1){
          notification.open({
            message: 'Oops!',
            description:
              'There are no images that contain your search! Feel free to add one to the album or try searching for "person" or "food"',
            onClick: () => {
              console.log('Notification');
            },
          });
        }
      })
      setSearchTerm('')
    }catch(e){
      console.log(e)
    }
  }

  // Callback function for antd to display the images when uploading
  const handleOnChange = ({ file, fileList, event }) => {
    setDefaultFileList(fileList);
  };

  const suffix = (
    <AudioOutlined
      style={{
        fontSize: 16,
        color: '#1890ff',
      }}
    />
  );

  return (
    <div>
      <Row justify="center">
        <Col>
          <h1 className="title">AI Photo Album</h1>
          <Divider />
        </Col>
        
      </Row>
      
      <div style={{textAlign: "center", marginTop:50}}><h1>Search for images based on a keyword!</h1></div>
      <div style={{textAlign: "center", marginTop:0}}><h3>Try searching "person" or "nature"</h3></div>

      <Row justify="center">
        <Col xs={22} sm={20} md={15} lg={10} xl={8} >
          <Search
            placeholder="Search for image..."
            enterButton="Search"
            size="large"
            suffix={suffix}
            value={searchTerm}
            onSearch={value => handleSearch(value)}
            onChange={e => searchHandler(e)}
            onPressEnter={value => handleSearch(value)}

          />
        </Col>
      </Row>
      <h2 style={{textAlign: "center", marginTop: 50}}>{searchHeader ?  "Your search: " + searchHeader : null}</h2>

      {isLoading ? <Spin tip="Loading..."><div className="gallery"></div></Spin>: 
        <div className="gallery">
            {isLoading ? <Spin/> : null}
            {photos.map((photo,index) => {return <div className="photoCard" key={index}><img src={photo} className="photo"></img></div>})}
        </div>
      }

      <div style={{textAlign: "center", marginTop:50}}><h1>Add Photos To The Public Database</h1>It may take about 15 seconds for the image to process</div>
      <div className="container">
        <div className="upload-btn">
          <Upload
            accept="image/*"
            customRequest={uploadImage}
            onChange={handleOnChange}
            listType="picture-card"
            defaultFileList={defaultFileList}
            className="image-upload-grid"
          >
            {defaultFileList.length >= 3 ? null : <div><PlusOutlined /></div>}
          </Upload>
          {progress > 0 ? <Progress percent={progress} /> : null}
        </div>
      </div>
    </div>
  );
};

export default PhotoAlbum
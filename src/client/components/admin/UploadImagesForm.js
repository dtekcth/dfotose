import _ from 'lodash';
import React from 'react';
import uiState from '../../UiState';
import PropTypes from 'prop-types';

export default class UploadImagesForm extends React.Component {
  static propTypes = {
    galleryImageList: PropTypes.object
  };
  
  constructor(props) {
    super(props);
    
    this.state = {
      percentDone: 0,
      isUploading: false,
      fileCount: 0,
      uploadComplete: false,
      uploadError: false,
      selectedFiles: []
    };
  }
  
  onFileSelect(event) {
  const files = event.target.files;

  if (files.length > 200) {
    alert('Du kan inte ladda upp fler än 200 filer åt gången.');
    // clear file input
    event.target.value = '';
    this.setState({ selectedFiles: [], fileCount: 0 });
    return;
  }

  this.setState({ 
    selectedFiles: files,
    fileCount: files.length,
    uploadComplete: false,
    uploadError: false
  });
}
  
  onSubmit(event) {
    event.preventDefault();
    
    const fileElement = document.getElementById('image');
    const files = fileElement.files;
    
    if (files.length === 0) {
      alert('Välj bilder att ladda upp först!');
      return;
    }
    
    this.setState({ 
      isUploading: true,
      fileCount: files.length,
      uploadComplete: false,
      uploadError: false
    });
    
    const formData = new FormData();
    _.forEach(files, file => {
      formData.append('photos', file);
    });
    
    const onProgress = (percent => {
      this.setState({ percentDone: percent });
      
      if (percent >= 100) {
        this.setState({ 
          isUploading: false,
          uploadComplete: true,
          selectedFiles: [],
          percentDone: 0
        });
        
        // Clear the file input
        document.getElementById('image').value = '';
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.setState({ uploadComplete: false });
        }, 5000);
      }
    }).bind(this);
    
    this.props.galleryImageList.addImages(formData, onProgress)
      .catch(err => {
        this.setState({ 
          isUploading: false,
          uploadError: true,
          percentDone: 0
        });
        console.error('Upload failed:', err);
      });
  }
  
  render() {
    const {percentDone, isUploading, fileCount, uploadComplete, uploadError, selectedFiles} = this.state;
    
    const progressBar = (
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Laddar upp {fileCount} bild{fileCount !== 1 ? 'er' : ''}...</h3>
        
        <div style={{ 
          width: '100%', 
          height: '30px', 
          background: '#ddd', 
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${percentDone}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #4CAF50, #45a049)',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              {Math.round(percentDone)}%
            </span>
          </div>
        </div>
        
        <p style={{ marginTop: '10px', color: '#666' }}>
          {percentDone < 100 ? 'Vänligen vänta...' : 'Bearbetar bilder...'}
        </p>
      </div>
    );
    
    const successMessage = (
      <div style={{ 
        padding: '15px', 
        background: '#d4edda', 
        color: '#155724',
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #c3e6cb'
      }}>
        {fileCount} bild{fileCount !== 1 ? 'er' : ''} laddades upp!
      </div>
    );
    
    const errorMessage = (
      <div style={{ 
        padding: '15px', 
        background: '#f8d7da', 
        color: '#721c24',
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb'
      }}>
        Uppladdning misslyckades. Försök igen.
      </div>
    );
    
    const formUpload = (
      <div>
        {uploadComplete && successMessage}
        {uploadError && errorMessage}
        
        <form onSubmit={ this.onSubmit.bind(this) }>
          <h3>Ladda upp bilder</h3>
          
          <div style={{ 
            border: '2px dashed #ccc', 
            borderRadius: '5px', 
            padding: '20px',
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <input 
              id="image" 
              type="file" 
              className="u-full-width" 
              name="photos" 
              accept="image/*" 
              multiple 
              onChange={this.onFileSelect.bind(this)}
              style={{ marginBottom: '10px' }}
            />
            
            {selectedFiles.length > 0 && (
              <p style={{ color: '#666', margin: '10px 0' }}>
                {selectedFiles.length} fil{selectedFiles.length !== 1 ? 'er' : ''} valda
              </p>
            )}
          </div>
          
          <input 
            className="button-primary button-orange" 
            type="submit" 
            value={`Ladda upp ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`} 
            name="submit"
            disabled={selectedFiles.length === 0}
            style={{ 
              marginTop: '15px',
              opacity: selectedFiles.length === 0 ? 0.5 : 1,
              cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer'
            }}
          />
        </form>
        
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Tänk på att när du laddar upp bilder kan det ta någon minut innan de dyker upp nedan. 
          Det är för att de måste hanteras av servern innan de kan användas.
        </p>
      </div>
    );

    return (
      <div>
        { isUploading ? progressBar : formUpload }
      </div>
    );
  }
}

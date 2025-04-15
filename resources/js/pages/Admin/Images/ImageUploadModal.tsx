import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';
import './ImageUploadModal.css'; // Import the CSS file

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, productId }) => {
    const [images, setImages] = useState<File[]>([]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImages(Array.from(event.target.files));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData();
        images.forEach((image) => {
            formData.append('images[]', image);
        });
        formData.append('product_id', productId.toString());

        // Make an API call to your ImageProductController
        try {
            const response = await fetch('/api/image-products', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                Swal.fire('Success', 'Images uploaded successfully!', 'success');
                onClose();
            } else {
                Swal.fire('Error', 'Failed to upload images.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'An error occurred while uploading images.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <h1>Upload Images</h1>
                
                <form onSubmit={handleSubmit}>
                    <input type="file" multiple onChange={handleImageChange} />
                    <Button className="upbutton" type="submit">Upload</Button>
                </form>
            </div>
        </div>
    );
};

export default ImageUploadModal;
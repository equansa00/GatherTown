import cloudinary
import cloudinary.api
import cloudinary.uploader

# Configure Cloudinary with your credentials
cloudinary.config(
    cloud_name="dwpamedkm",
    api_key="467823737854287",
    api_secret="p8lcsI125dMVNFoly6GtUI0ejz8"
)

def delete_all_images():
    try:
        # Fetch all image resources
        resources = cloudinary.api.resources(type="upload", resource_type="image", max_results=500)
        while resources['resources']:
            for resource in resources['resources']:
                public_id = resource['public_id']
                # Delete each image by public_id
                cloudinary.uploader.destroy(public_id, resource_type='image')
                print(f"Deleted image with public_id: {public_id}")
            # Fetch next batch of resources (if any)
            resources = cloudinary.api.resources(type="upload", resource_type="image", max_results=500, next_cursor=resources.get('next_cursor'))
        print("All images have been deleted.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Call the function to delete all images
delete_all_images()


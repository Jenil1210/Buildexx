const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Create a dummy file if not exists
if (!fs.existsSync('test_upload.txt')) {
    fs.writeFileSync('test_upload.txt', 'This is a test upload file content.');
}

cloudinary.config({
    cloud_name: 'buildexx',
    api_key: '933257613118445',
    api_secret: 'FiGbAJHeogIXq-H1S6m7Xey1rRw'
});

console.log("Attempting upload...");

cloudinary.uploader.upload("test_upload.txt", { resource_type: "auto" }, function (error, result) {
    if (error) {
        console.error("Upload Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Upload Success:", result.secure_url);
    }
});

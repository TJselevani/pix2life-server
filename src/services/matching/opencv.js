const cv = require('opencv4nodejs');
const fetch = require('node-fetch');
const fs = require('fs');

class OpenCV {
  constructor() {
    this.orb = new cv.ORB();
  }

  // Load an image from a file path
  loadImageFromPath(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found at path: ${imagePath}`);
    }
    return cv.imread(imagePath);
  }

  // Load an image from a URL
  async loadImageFromUrl(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    return cv.imdecode(buffer); // Decode buffer to OpenCV Mat
  }

  // Extract features from an image
  extractFeatures(image) {
    const grayImage = image.bgrToGray(); // Convert to grayscale
    const keypoints = this.orb.detect(grayImage); // Detect keypoints
    const descriptors = this.orb.compute(grayImage, keypoints); // Compute descriptors
    return { keypoints, descriptors };
  }

  // Match features between two images
  matchImages(image1Path, image2Path) {
    const img1 = this.loadImage(image1Path);
    const img2 = this.loadImage(image2Path);

    const { keypoints: kp1, descriptors: des1 } = this.extractFeatures(img1);
    const { keypoints: kp2, descriptors: des2 } = this.extractFeatures(img2);

    // Use BFMatcher to match descriptors
    const matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
    const matches = matcher.match(des1, des2);

    // Draw matches on the output image
    const matchedImage = cv.drawMatches(img1, kp1, img2, kp2, matches);

    return { matchedImage, matches };
  }

  // Save the matched image to a file
  saveMatchedImage(matchedImage, outputPath) {
    cv.imwrite(outputPath, matchedImage);
  }

  // Match features between provided features and a list of images
  findBestMatch(features, images) {
    let bestMatch = null;
    let bestScore = Infinity;

    images.forEach((imageObj) => {
      const dbFeatures = imageObj.features; // Assuming features are stored in the image object
      const score = this.compareFeatures(features.descriptors, dbFeatures);
      if (score < bestScore) {
        bestScore = score;
        bestMatch = imageObj;
      }
    });

    return bestMatch;
  }

  // Compare two feature descriptors using Hamming distance
  compareFeatures(descriptors1, descriptors2) {
    const matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
    const matches = matcher.match(descriptors1, descriptors2);

    // Calculate the average distance of matches as a score
    const totalDistance = matches.reduce(
      (sum, match) => sum + match.distance,
      0
    );
    return totalDistance / matches.length; // Return average distance as score
  }

  // Main method to extract features from an image URL and find the best match
  async matchImageFromUrl(imageUrl, images) {
    try {
      const inputImage = await this.loadImageFromUrl(imageUrl);
      const inputFeatures = this.extractFeatures(inputImage);
      return this.findBestMatch(inputFeatures, images);
    } catch (error) {
      console.error(`Error in matching image: ${error.message}`);
      throw error;
    }
  }
}

module.exports = OpenCV;

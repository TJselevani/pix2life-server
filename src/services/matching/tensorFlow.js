const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const fetch = require('node-fetch');
const { Image } = require('canvas');
const logger = require('../../loggers/logger');
const { InternalServerError } = require('../../errors/application-errors');

class TensorFlow {
  static model;

  static async loadModel() {
    if (!this.model) {
      try {
        this.model = await mobilenet.load();
        logger.info('Model loaded');
      } catch (error) {
        logger.error(`Error loading model: ${error.message}`);
        throw new InternalServerError('Failed to load model');
      }
    }
    return this.model;
  }

  static async extractStoredImageFeatures(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const decodedImage = tf.node.decodeImage(imageBuffer);
      const model = await this.loadModel();
      const logits = model.infer(decodedImage, 'conv_preds');
      decodedImage.dispose(); // Dispose of the tensor to free up memory
      return logits.arraySync();
    } catch (error) {
      logger.error(`Error extracting features: ${error.message}`);
      throw new InternalServerError('Failed to extract features');
    }
  }

  static async extractFeatures(imageUrl) {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      const imageBuffer = await response.buffer();

      // Decode the image buffer into a Tensor
      const decodedImage = tf.node.decodeImage(imageBuffer);

      // Load the model and extract features
      const model = await this.loadModel();
      const logits = model.infer(decodedImage, 'conv_preds');

      // Dispose of the tensor to free up memory
      decodedImage.dispose();

      return logits.arraySync();
    } catch (error) {
      logger.error(`Error extracting features: ${error.message}`);
      throw new Error('Failed to extract features');
    }
  }

  static async classifyStoredImage(imagePath) {
    try {
      const img = new Image();
      img.src = fs.readFileSync(imagePath);
      const model = await this.loadModel();
      const predictions = await model.classify(img);
      return predictions;
    } catch (error) {
      logger.error(`Error classifying image: ${error.message}`);
      throw new InternalServerError('Failed to classify image');
    }
  }

  static async classifyImage(imageUrl) {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      const imageBuffer = await response.buffer();

      // Decode the image buffer into a Tensor
      const decodedImage = tf.node.decodeImage(imageBuffer);

      // Load the model and classify the image
      const model = await this.loadModel();
      const predictions = await model.classify(decodedImage);

      // Dispose of the tensor to free up memory
      decodedImage.dispose();

      return predictions;
    } catch (error) {
      logger.error(`Error classifying image: ${error.message}`);
      throw new Error('Failed to classify image');
    }
  }

  static async findMatchingImage(features, images) {
    try {
      let bestMatch = null;
      let bestScore = Infinity;

      images.forEach((image) => {
        const dbFeatures = image.features;
        const score = tf.losses
          .meanSquaredError(tf.tensor(dbFeatures), tf.tensor(features))
          .arraySync();

        if (score < bestScore) {
          bestScore = score;
          bestMatch = image;
        }
      });

      return bestMatch;
    } catch (error) {
      logger.error(`Error finding matching image: ${error.message}`);
      throw new InternalServerError('Failed to find matching image');
    }
  }
}

module.exports = TensorFlow;

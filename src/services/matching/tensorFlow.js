const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
// const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const fetch = require('node-fetch');
const { Image } = require('canvas');
const logger = require('../../loggers/logger');
const { InternalServerError } = require('../../errors/application-errors');

class TensorFlow {
  static model;

  // Load the model.
  static async checkModel() {
    try {
      this.model = await mobilenet.load();
      return true;
    } catch (error) {
      logger.warn(error.message);
      return false;
    }
  }

  static async loadModel() {
    if (!this.model) {
      const primaryModelUrl =
        'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1';
      const fallbackModelUrl =
        'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v2_100_224/classification/3/model.json';

      try {
        // Attempt to load the model from the primary URL
        logger.debug(
          `Attempting to load model from primary URL: ${primaryModelUrl}`
        );
        this.model = await tf.loadGraphModel(primaryModelUrl, {
          fromTFHub: true,
        });
        logger.debug('Model loaded from primary URL');
      } catch (primaryError) {
        logger.warn(`Primary URL failed: ${primaryError.message}`);

        try {
          // Fallback to the secondary URL
          logger.debug(
            `Attempting to load model from fallback URL: ${fallbackModelUrl}`
          );
          this.model = await tf.loadGraphModel(fallbackModelUrl);
          logger.debug('Model loaded from fallback URL');
        } catch (fallbackError) {
          logger.error(`Fallback URL failed: ${fallbackError.message}`);
          throw new InternalServerError(
            'Failed to load model from both primary and fallback URLs'
          );
        }
      }
    }

    return this.model;
  }

  static async extractStoredImageFeatures(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const decodedImage = tf.node.decodeImage(imageBuffer);
      const resizedImage = tf.image.resizeBilinear(decodedImage, [224, 224]); // Resize image
      const model = await this.loadModel();
      const logits = model.infer(resizedImage, 'conv_preds');
      decodedImage.dispose(); // Dispose of the tensor to free up memory
      resizedImage.dispose(); // Dispose resized image
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

      // Resize image before classification
      const resizedImg = await tf.node.decodeImage(img.src);
      const resizedTensor = tf.image.resizeBilinear(resizedImg, [224, 224]);

      const model = await this.loadModel();
      const predictions = await model.classify(resizedTensor);

      resizedTensor.dispose(); // Dispose of the tensor after use
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

// static async extractStoredImageFeatures(imagePath) {
//   try {
//     const imageBuffer = fs.readFileSync(imagePath);
//     const decodedImage = tf.node.decodeImage(imageBuffer);
//     const model = await this.loadModel();
//     const logits = model.infer(decodedImage, 'conv_preds');
//     decodedImage.dispose(); // Dispose of the tensor to free up memory
//     return logits.arraySync();
//   } catch (error) {
//     logger.error(`Error extracting features: ${error.message}`);
//     throw new InternalServerError('Failed to extract features');
//   }
// }

// static async classifyStoredImage(imagePath) {
//   try {
//     const img = new Image();
//     img.src = fs.readFileSync(imagePath);
//     const model = await this.loadModel();
//     const predictions = await model.classify(img);
//     return predictions;
//   } catch (error) {
//     logger.error(`Error classifying image: ${error.message}`);
//     throw new InternalServerError('Failed to classify image');
//   }
// }

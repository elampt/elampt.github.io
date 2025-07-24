# Artificial Intelligence In Context
> AI - Simulating human-like reasoning and cognitive processes in computers
   **Goal of AI :** To create systems that can perform tasks that normally require human intelligence

Process vast data -> Learn Patterns -> Make informed decisions

# Fundamentals of AI and ML
**Artificial Intelligence: Machine Learning**
- Data --(Training)--> ML Algorithms(Model) -> Trained Model -> Testing

## Demo: Machine Learning
**Amazon Rekognition :** Deep-learning-based visual analysis service in AWS (Offers Image recognition service and can be accessed using API to use in our Applications)
 - AWS provides many pre-trained models for common tasks

## Types of Machine Learning
1. **Supervised Learning** (Learning from labelled data): Classifying Images, Speech Recognition, Self Driving Cars, Recognize Songs and artists, Bank Fraud
2. **Unsupervised Learning** (Provide unlabelled data and let the algorithm come up with patterns on it's own)
3. **Reinforcement Learning** (Learning by training and error - System takes actions and is rewarded or penalized): Playing games, Learning mechanics of Movement and balance, Driving strategies

## Algorithms and Models
### Traditional Machine Learning
> Apt for structured data
1. **Decision Trees** - Flowchart-like structures aiding in decision-making based on data features.
2. **Regression Algorithms** - Useful for predicting numerical values by modeling relationships between variables.
3. **Clustering Algorithms** - Group data into clusters based on similarity, aiding in data segmentation and categorization.
### Deep Learning
1. **Artificial Neural Networks** - Inspired by the human brain, these networks excel in processing huge amounts of data and learning patterns from it
2. **Convolutional Neural Networks (CNNs)** - Specialized for vision tasks, preserving spatial context of images.
3. **Recurrent Neural Networks (RNNs)** - Efficient for sequential data, aiding in tasks like predictive text
### Advanced Deep Learning
1. **Generative Models** - Aim to generate new data samples similar to input data, useful in creating new content
2. **Transformer Architecture** - Consisting of encoders(Takes in inputs) and decoders(Gives the output), crucial in language translation and code generation tasks.

## Discriminative, Predictive, and Generative AI
**Discriminative / Predictive**
- Focuses on classifying and predicting specific outcomes based on input data
**Generative / Probabilistic**
- Aims to produce new data samples that resemble input

## Machine Learning Pipeline
![[ML - Pipeline.png]]

## Machine Learning Tools and Services (AWS)
### Machine Learning Stack Layers :
1. The Data layer
2. The model layer
3. The deployment and monitoring layer
### Tools for Machine Learning:
1. Jupyter Notebook
2. JupyterLab (JupyterLab offers much more features and an enhanced interface, which can be extended through extensions)
3. Pandas (Used for data handling and analysis)
4. Matplotlib (Used for scientific, static visualizations on data)
5. Seaborn (Built on Matplotlib, provides high level interface for statistical graphics)
6. NumPy (Used for Scientific computing)
7. Scikit-Learn (Open-source ML library that supports supervised and un-supervised learning)
8. Some AWS supported frameworks (Can be used from Amazon SageMaker):
	1. PyTorch
	2. TensorFlow
	3. Keras
	4. Torch
	5. CNTK
## Amazon Instances designed for Machine Learning Applications
1. Amazon EC2 C5 and C5n instances
2. Amazon EC2 P3 instances
3. AWS IoT Greengras
4. Amazon Elastic Inference

### Machine Learning managed Services
> AWS offers many managed services that do not require any ML experience

1. Computer Vision
	1. Amazon Recoknition
	2. Amazon Textract
2. Chat Interface
	1. Amazon Lex
3. Speech
	1. Amazon Poly
	2. Amazon Transcribe
4. Fraud Detecting
	1. Amazon Fraud Detector
5. Language
	1. Amazon Comprehend
	2. Amazon Translate
6. Recommendations
	1. Amazon Personalize

### Amazon SageMaker
> Helps data scientists and developers to prepare, build, train and deploy high-quality machine learning models (Prepare -> Build -> Train & Tune -> Deploy & Manage)

**SageMaker Features :**
1. **SageMaker Notebooks** (It can deploy ML instances that run on Jupyter Notebook or JupyterLab)
2. **Instance types** 
![[AWS - Sagemaker_instances.png]]
3. **Data Visualization**
4. **Model Selection** 
5. **Deployment**
6. **Marketplace integration**

### Additional Resources
[Machine Learning Ramp Up Guide](https://d1.awsstatic.com/training-and-certification/ramp-up_guides/Ramp-Up_Guide_Machine_Learning.pdf)
[Machine Learning on AWS](https://aws.amazon.com/ai/machine-learning/)
[AWS Machine Learning Blog](https://aws.amazon.com/blogs/machine-learning/)
[Machine Learning Solutions in the AWS marketplace](https://aws.amazon.com/marketplace/solutions/machine-learning)
[Amazon Machine Learning Documentation](https://docs.aws.amazon.com/machine-learning/?id=docs_gateway)
[Machine Learning in the AWS Partner Network](https://aws.amazon.com/partners/)

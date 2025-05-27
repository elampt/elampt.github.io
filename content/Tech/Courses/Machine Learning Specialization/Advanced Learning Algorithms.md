# Neural networks intuition
> Origins: Algorithms that try to mimic the brain

>[!tip] As the amount of data in all digital mediums kept increasing, the traditional ML models beyond a certain threshold couldn't use the Big Data as advantage to improve their performance. However, a small neural network was able to give better performance with the  amount of data [GPU's - Initially designed to improve computer graphics, turned out to efficiently help in processing neural network models]

## Demand Prediction Example
![[ML2 - Neural Network.png]]
**The above image consists:**
1. Input Layer (Represents features used to predict demand)
2. Hidden Layer (Contains neurons (nodes/units) that perform internal computation and generate activations)
3. Output Layer (Produces the **final prediction** output)
### Neural Network Process
1. Input features → feed into hidden layer.
2. Hidden layer computes activations using learned weights.
3. Activations → passed to output layer.
4. Output layer generates final prediction (e.g., probability).

# Neural Network Model
## Neural Network Layer
![[ML - Neural Network Layer.png]]
* The above figure shows the expansion of a hidden layer (layer 1), with the naming conventions, ways to write the parameters, outputs to the respective layers (We can say that there are **two layers** in the above neural network, we usually don't include the input layer)
* The input and output layers are classified as layer 0 and layer 2 in the above diagram
* Each neuron of the layer 1 perform logistic regression and give outputs which are then combined to output  **activation vector** which is given as an input to the **output layer**
* The **output layer** again performs logistic regression with the **activation vector** to give the **layer 2** output **activation vector** with which we can do our inference (By using a decision boundary/ threshold)
* Since the computation goes from **left** to **right**, this algorithm is also called **Forward Propagation**. However the Gradient Descent uses **Back Propagation** to calculate derivatives 


**Activation value of layer l, unit(neuron) j**
$$
a_j^{[l]} = g\left( w_j^{[l]} \cdot a^{[l-1]} + b_j^{[l]} \right)
$$
$$
\text{where:}
$$
$$
a_j^{[l]} = \text{activation value of unit } j \text{ in layer } l
$$
$$
w_j^{[l]} = \text{weight vector of unit } j \text{ in layer } l
$$
$$
a^{[l-1]} = \text{activation vector from layer } l-1
$$
$$
b_j^{[l]} = \text{bias of unit } j \text{ in layer } l
$$
$$
g(\cdot) = \text{activation function (e.g., sigmoid, ReLU)}
$$
# Neural Network Training
## Tensorflow code
```python3
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense

# STEP 1 - Specifies architecture of the neural network
model = Sequential([
	Dense(units=25, activation='sigmoid'),
	Dense(units=15, activation='sigmoid'),
	Dense(units=1, activation='sigmoid'),
])

# STEP 2 - Loss and cost functions (Logistic loss -> Binary Cross Entropy)
# Incase we have a regression problem, we can use (loss -> MeanSquaredError())

from tensorflow.keras.losses import BinaryCrossentropy
model.compile(loss=BinaryCrossentropy())


# STEP 3 - Gradient descent to minimize the cost function (Also computes derivatives for gradient descent using "back propagation")

model.fit(X,Y, epochs=100) #epochs refer to number of steps in gradient descent
```
# Activation Functions
Mostly commonly used **Activation functions :**
1. Linear Activation Function - Preferred fro Regression
2. Sigmoid - Preferred for binary classification 
3. ReLU (Rectified Linear Unit) - To get any positive value as output. Has lower **Computational Cost**, faster **Convergence Speed**
![[ML - Activation Functions.png]]
## Choosing Activation Functions
### Output Layer
* Need to choose depending on what the target of ground truth label y
* Binary **Classification** problem -> **Sigmoid** activation function
* **Regression** (Positive or Negative output values) -> **Linear Activation Function**
* **Regression** (Need only non-negative output value) -> **ReLU**
### Hidden Layer
* **ReLU** Activation Function is the most common choice - **Faster Learning**
* Apart from computation speed, another reason to prefer **ReLU** over **Sigmoid** activation function is because of the fact that **ReLU** activation function is completely **flat** in one side of the graph whereas the **Sigmoid** activation function goes flat in two places (To the left and right of the graph)
* When we use Gradient descent to train a neural network, when there is a function that is flat in a lot of places, Gradient descent would be **very slow**
## Why do we need Activation Functions ?
* Let's assume we use the **Linear activation function** in all the hidden layers and the output layer - > This would eventually result in **Linear Regression**
* Let's assume we use the **Linear activation function** in all the hidden layers and **Sigmoid activation function** in the output layer -> This would eventually result in **Logistic Regression**
* Both the above cases fail to use the potential of the entire neural network model

# Multi-class Classification
> Classification problems with more than two possible output labels

## Softmax
Generalization of logistic regression to the multi-class classification context

**Softmax Regression (4 possible outputs, example)**
$$
z_1 = \vec{w}_1 \cdot \vec{x} + b_1
$$
$$
a_1 = \frac{e^{z_1}}{e^{z_1} + e^{z_2} + e^{z_3} + e^{z_4}} = P(y = 1 \mid \vec{x}) = 0.30
$$
$$
z_2 = \vec{w}_2 \cdot \vec{x} + b_2
$$
$$
a_2 = \frac{e^{z_2}}{e^{z_1} + e^{z_2} + e^{z_3} + e^{z_4}} = P(y = 2 \mid \vec{x}) = 0.20
$$
$$
z_3 = \vec{w}_3 \cdot \vec{x} + b_3
$$
$$
a_3 = \frac{e^{z_3}}{e^{z_1} + e^{z_2} + e^{z_3} + e^{z_4}} = P(y = 3 \mid \vec{x}) = 0.15
$$
$$
z_4 = \vec{w}_4 \cdot \vec{x} + b_4
$$
$$
a_4 = \frac{e^{z_4}}{e^{z_1} + e^{z_2} + e^{z_3} + e^{z_4}} = P(y = 4 \mid \vec{x}) = 0.35
$$

**Softmax Regression (N possible outputs: y = 1, 2, 3, ..., N)**
$$
z_j = \vec{w}_j \cdot \vec{x} + b_j \quad \text{for } j = 1, 2, \dots, N
$$
$$
a_j = \frac{e^{z_j}}{\sum_{k=1}^{N} e^{z_k}} = P(y = j \mid \vec{x})
$$
$$
\text{Note: } a_1 + a_2 + \dots + a_N = 1
$$

## Cost Function
**Softmax Regression**
$$
a_1 = \frac{e^{z_1}}{e^{z_1} + e^{z_2} + \cdots + e^{z_N}} = P(y = 1 \mid \vec{x})
$$
$$
\vdots
$$
$$
a_N = \frac{e^{z_N}}{e^{z_1} + e^{z_2} + \cdots + e^{z_N}} = P(y = N \mid \vec{x})
$$
**Cross-Entropy Loss Function**

$$
\text{loss}(a_1, \dots, a_N, y) =
\begin{cases}
-\log a_1 & \text{if } y = 1 \\
-\log a_2 & \text{if } y = 2 \\
\ \vdots \\
-\log a_N & \text{if } y = N
\end{cases}
$$
$$
\text{loss} = -\log a_j \quad \text{if } y = j
$$
## Tensor Flow Implementation - Softmax
![[ML - Softmax.png]]

This is the code to solve Multi-class classification problem
```python3
model = Sequential([
	Dense(units=25, activation='relu'),
	Dense(units=15, activation='relu'),
	Dense(units=10, activation='softmax')
	])
	
model.compile(loss=SparseCategoricalCrossEntropy())
```

The following code does the same calculations as the previous code, but is more **numerically accurate** (Referred to as "Numerical roundoff errors" )
```python3
model = Sequential([
	Dense(units=25, activation='relu'),
	Dense(units=15, activation='relu'),
	Dense(units=10, activation='linear') #softmax is replaced with linear
	])
	
model.compile(loss=SparseCategoricalCrossEntropy(from_logits=True))

model.fit(X, Y, epochs=100)

logits = model(X) #The final neural network layer no longer outputs probabilities a1...a0. Insetead it outputs z1....z10. 

f_x = tf.nn.softmax(logits) #Hence, we pass it through the softmax function in order to get the probability
```

## Multi-label Classification
* Given an input image, the model has to predict if the specified elements are present or not
* To achieve this, we can design a neural network where the Output layer consists of three sigmoid activation units. With the output layer, we'll get **y** as the output
$$
\text{Image 1:}
\quad y = 
\begin{bmatrix}
1 \\
0 \\
1
\end{bmatrix}
\quad
\begin{aligned}
\text{Is there a car?} &\quad \text{yes} \\
\text{Is there a bus?} &\quad \text{no} \\
\text{Is there a pedestrian?} &\quad \text{yes}
\end{aligned}
$$
$$
\text{Image 2:}
\quad y = 
\begin{bmatrix}
0 \\
0 \\
1
\end{bmatrix}
\quad
\begin{aligned}
\text{Is there a car?} &\quad \text{no} \\
\text{Is there a bus?} &\quad \text{no} \\
\text{Is there a pedestrian?} &\quad \text{yes}
\end{aligned}
$$
$$
\text{Image 3:}
\quad y = 
\begin{bmatrix}
1 \\
1 \\
0
\end{bmatrix}
\quad
\begin{aligned}
\text{Is there a car?} &\quad \text{yes} \\
\text{Is there a bus?} &\quad \text{yes} \\
\text{Is there a pedestrian?} &\quad \text{no}
\end{aligned}
$$
# Advanced Optimization
> There are a few algorithms for optimization (Reducing Cost function) that are better than Gradient Descent
## Adam (Adaptive Moment estimation) Algorithm
* **Increase α** - During the gradient descent process, if the next consecutive steps are being taken in the same direction, one small step at a time, the algorithm finds it and increases the **learning rate** value
* **Decrease α** - Similarly, if we have initialized the **learning rate** to a bigger value during the stat of the gradient descent and because of this the next steps are too deviated, hence the algorithm decreases the **learning rate** value 

**Code :**
The initial learning_rate is passed to the code
```python3
mode.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
  loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True))
```

# Additional Layer Types
**Dense Layer :** Each neuron output is a function of all the activation outputs of the previous layer

**Convolutional Layer :** Each neuron only looks at part of the previous layer's outputs
* Faster computation
* Need less training data (Less prone to overfitting)
![[ML - CNN.png]]

# Advice for applying Machine Learning
## Evaluating a model
> **Train-Test split**
* Split the dataset into two parts, the **Training set**(70%) and **Testing set**(30%)
* We find the parameters by minimizing cost function for the training set
* Then, we compute the test error (squared error cost) to find how well the training data has trained the model
* **Problem with this method :** The test error is likely to be an optimistic estimate of the generalization error. The model may not work properly when a new data is input for it to calculate/ classify
## Model Selection and training/cross validation/test sets
> **Train - Cross Validation - Test split**
* Split the dataset into three parts, the **Training set**(60%), **Cross validation set**(20%) and **Testing set**(20%)
* We find the parameters by minimizing cost function for the training set

We train models of increasing complexity (polynomial degree $d$):

$$
d = 1: \quad f_{\vec{w}, b}(\vec{x}) = w_1 x + b
$$
$$
d = 2: \quad f_{\vec{w}, b}(\vec{x}) = w_1 x + w_2 x^2 + b
$$
$$
d = 3: \quad f_{\vec{w}, b}(\vec{x}) = w_1 x + w_2 x^2 + w_3 x^3 + b
$$
$$
\vdots
$$
$$
d = 10: \quad f_{\vec{w}, b}(\vec{x}) = w_1 x + w_2 x^2 + \cdots + w_{10} x^{10} + b
$$
Evaluate each model on the cross-validation set:
$$
J_{cv}(w^{\langle 1 \rangle}, b^{\langle 1 \rangle}), \quad
J_{cv}(w^{\langle 2 \rangle}, b^{\langle 2 \rangle}), \quad \ldots, \quad
J_{cv}(w^{\langle 10 \rangle}, b^{\langle 10 \rangle})
$$
Choose the model with the lowest cross-validation error. Suppose it's $d = 4$:
$$
\text{Pick:} \quad f_{\vec{w}, b}(\vec{x}) = w_1 x + w_2 x^2 + w_3 x^3 + w_4 x^4 + b
$$
$$
\text{Model chosen based on: } J_{cv}(w^{\langle 4 \rangle}, b^{\langle 4 \rangle})
$$
Estimate generalization error using the test set:
$$
J_{test}(w^{\langle 4 \rangle}, b^{\langle 4 \rangle})
$$
# Bias and Variance
![[ML - Bias and Variance.png]]
## Regularization and bias/ variance
* A very **high lambda(λ) value** would make the parameter **w** to be of a very low value (~0) thus causing **high bias/ under-fitting**
* A very **low lambda(λ) value** would mean **minimum regularization** causing **high variance/ over-fitting**
![[ML - Regularization bias and variance.png]]
## Establishing a baseline level of performance
 What is the level of error we can reasonably hope to get to ?
 * Human level performance
 * Competing algorithms performance
 * Guess based on experience
### Case 1: High Variance
- **Baseline Error:** 10.6%
- **Training Error (J_train):** 10.8%
- **Validation Error (J_cv):** 14.8%
- **Train - Baseline Gap:** 0.2%
- **Validation - Train Gap:** 4.0%
- **Diagnosis:** High Variance
### Case 2: High Bias
- **Baseline Error:** 10.6%
- **Training Error (J_train):** 15.0%
- **Validation Error (J_cv):** 15.5%
- **Train - Baseline Gap:** 4.4%
- **Validation - Train Gap:** 0.5%
- **Diagnosis:** High Bias
### Case 3: High Bias + High Variance
- **Baseline Error:** 10.6%
- **Training Error (J_train):** 15.0%
- **Validation Error (J_cv):** 19.7%
- **Train - Baseline Gap:** 4.4%
- **Validation - Train Gap:** 4.7%
- **Diagnosis:** High Bias and High Variance
## Learning Curves
* If a learning algorithm suffers from **high bias**, getting more training data **will not (by itself) help much**
* If a learning algorithm suffers from **high variance**, getting more training data is **likely to help**

We've implemented regularized linear regression on housing prices:
$$
J(\vec{w}, b) = \frac{1}{2m} \sum_{i=1}^{m} \left(f_{\vec{w}, b}(\vec{x}^{(i)}) - y^{(i)}\right)^2 + \frac{\lambda}{2m} \sum_{j=1}^{n} w_j^2
$$
But it makes unacceptably large errors in predictions. What do we try next?
### Possible Fixes and What They Address
1. Get more training examples  
   Fixes: **High Variance**
2. Try smaller sets of features  
   Fixes: **High Variance**
3. Try getting additional features  
   Fixes: **High Bias**
4. Try adding polynomial features (e.g., \(x_1^2, x_2^2, x_1 x_2, ...))  
   Fixes: **High Bias**
5. Try decreasing (λ)  
   Fixes: **High Bias**
6. Try increasing (λ)  
   Fixes: **High Variance**
## Bias/ variance and neural networks
* Large neural networks are low bias machines
* A large neural network will usually do as well or better than a smaller one so long as regularization is chosen appropriately (Though it may slow down the performance of the algorithm)

**Un-regularized MNIST model**
```python3
layer_1 = Dense(units=25, activation="relu")
layer_2 = Dense(units=15, activation="relu")
layer_3 = Dense(units=1, activation="sigmoid")
model = Sequential([layer_1, layer_2, layer_3])
```

**Regularized MNIST model**
```python3
layer_1 = Dense(units=25, activation="relu", kernel_regularizer=L2(0.01))
layer_2 = Dense(units=15, activation="relu", kernel_regularizer=L2(0.01))
layer_3 = Dense(units=1, activation="sigmoid", kernel_regularizer=L2(0.01))
model = Sequential([layer_1, layer_2, layer_3])
```

# Machine Learning Development Process
## Iterative loop of ML development
1. Choose architecture (model, data , etc.)
2. Train model
3. Diagnostics (bias, variance and error analysis)
Let's take the example of spam classifier, try the following methods to reduce the error:
* Collect more data. E.g., "honeypot" project
* Develop sophisticated features based on email routing (From email header)
* Define sophisticated features from email body. E.g., should "discounting" and "discount" be treated as the same word
* Design algorithms to detect misspellings. E.g., w4tches, med1cine, m0rtgage
## Error analysis
* Second important task after figuring out bias and variance diagnostics
* In case the algorithm misclassifies a lot, a manual examination might be needed for the fix

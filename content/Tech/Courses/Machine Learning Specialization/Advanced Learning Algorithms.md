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
* Since the computation goes from **left** to **right**, this algorithm is also called **Forward Propagation**


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
1. Linear Activation Function
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


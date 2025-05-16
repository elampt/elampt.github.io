> ML is the field of study that gives computers the ability to learn without being explicitly programmed

# Supervised vs. Unsupervised Machine Learning
## Supervised Learning
```
  x         ----->      y
input              output label
```
Learns from being given "right answers" (We provide enough examples with input **x** along with corresponding output label **y** from which the machine learns. Eventually, when we give an new input without output label, it'll generate the output by itself based on the learning)
### Regression
Type of Supervised Learning that predicts a **number** (There could be infinitely many possible outputs)
>[!example] Housing price prediction (Given a set of House size with the corresponding Price for it, we make the algorithm to fit a curve along the given points, now when we need the price for a new house with a randomly input House size, we can get the value from the point of intersection of the curve)

![[ML - Regression.png]]

### Classification
 We use classification to predict only a small number of possible outcomes/ categories (Ex: Predict if a tumor is malignant or benign based on it's size)
 * Classification predict **categories** (Cat or Dog; Benign or Malignant; 0 or 1 or 2). The learning algorithm sets a boundary line for the given data for classification
 ![[ML - Classification.png]]
## Unsupervised Learning
Find something interesting in **unlabeled data** (We only provide input x, not output labels y). We let the algorithm to search for a structure in the input data
### Clustering
> The algorithm groups the unlabeled similar input data into clusters.> 

Following are some examples:
1. Google News (Clustering of similar news)
2. DNA microarray (Clustering of people with similar DNA characteristics)
### Anomaly Detection
> Find unusual data points
### Dimensionality Reduction
> Compress data using fewer numbers

# Regression Model
## Linear Regression Model
> This is a **Supervised learning** model. Linear regression is one of the regression models. Predicts numbers

>[!tip] Terminology
>Data used to train the model  = **Training Set** <br>
>x = "**input**" variable (**feature**)<br>
>y = "**output**" variable (**target**)<br>
>ŷ = modles predicted value<br>
>y = true or observed value of the dependent variable<br>
>m = number of training examples<br>
>(x, y) = single training example<br>
>(x$^i$, y$^i$) = i$^t$$^h$ training example

```SQL
	              +----------+---------+
                  |     Training set   |
                  +----------+---------+
                             |
                             ▼
		          +----------+---------+
                  | Learning algorithm |
                  +----------+---------+
                             |
                             ▼
					 +-------+------+
	     x  --->     |  f(function) |     --->  ŷ
	 (feature)       +-------+------+      (prediction)



						 +-+-+
e.g:  size --->          | f |            ---> price
						 +-+-+              (estimated)
```
   ![[Screenshot 2025-05-16 at 4.49.11 PM.png|500]]
## Cost Function: Squared Error cost function
> A mathematical function that measures the difference between a model's predictions and the actual values

 The cost function \( **J(w, b)** \) is defined as:
$$
J(w, b) = \frac{1}{2m} \sum_{i=1}^{m} \left( \hat{y}^{(i)} - y^{(i)} \right)^2
$$
$$
\hat{y}^{(i)} = f_{w,b}(x^{(i)}) = wx^{(i)} + b
$$
$$
y^{(i)} \text{ is the true label/output}
$$
$$
m \text{ is the number of training examples}
$$
$$
f_{w,b}(x) \text{ is the hypothesis (linear model)}
$$

The goal is to find \( w, b \) such that:
$$
\hat{y}^{(i)} \approx y^{(i)} \quad \text{for all } (x^{(i)}, y^{(i)})
$$

### Visualizing the cost function
![[Screenshot 2025-05-16 at 6.26.49 PM.png]]
* When we represent the cost function with two input parameters (w, b) we'll get a 3D shape
* The height of any point corresponding to w and b values will be the Cost Function value (The higher the point, higher the value of cost function)
* To represent the cost function in 2D, we use the **Contour plot graph** which appears to be the sliced version of the 3D plot (The **smallest** oval shape represents the **minimum** value of the Cost Function)







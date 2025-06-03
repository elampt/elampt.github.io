# Clustering
> Looks at a number of data points and automatically finds data points that are related or similar to each other

**Applications :**
* Grouping similar news
* Market segmentation
* DNA analysis
* Astronomical data analysis
## K-means Clustering algorithm
Repeatedly do:
1. Assign point to cluster centroids
2. Recompute cluster centroids (To average of all points that were assigned to it )
![[ML - K-means.png]]
## Optimization Objective
 > K - means is guaranteed to converge (On every single iteration, the **distortion** cost function should go down or stay the same. If it ever goes up, it means there is a bug in the code. If the value doesn't change in the next iteration, it also means K - means has converged)
$$
c^{(i)} = \text{index of cluster } (1, 2, \dots, K) \text{ to which example } x^{(i)} \text{ is assigned}
$$
$$
\mu_k = \text{cluster centroid } k
$$
$$
\mu_{c^{(i)}} = \text{cluster centroid of the cluster to which } x^{(i)} \text{ has been assigned}
$$

$$
\text{Cost function:}
$$
$$
J(c^{(1)}, \dots, c^{(m)}, \mu_1, \dots, \mu_K) = \frac{1}{m} \sum_{i=1}^{m} \left\| x^{(i)} - \mu_{c^{(i)}} \right\|^2
$$
$$
\min_{c^{(1)}, \dots, c^{(m)}, \mu_1, \dots, \mu_K} J(c^{(1)}, \dots, c^{(m)}, \mu_1, \dots, \mu_K)
$$
## Initializing K-means
> Very first step of K-mean is to choose random locations as the initial guesses for the cluster centroids. How to do it best?

* Choose K < m
* Randomly pick K training examples
* Set (μ1, μ2, ..., μk) the centroids equal to these K examples

$$
\text{For } i = 1 \text{ to } 100 \{
$$
$$
\text{Randomly initialize K-means (choose } k \text{ random centroids)}
$$
$$
\text{Run K-means: Get } c^{(1)}, \dots, c^{(m)}, \mu_1, \dots, \mu_K
$$
$$
\text{Compute cost (distortion): } J(c^{(1)}, \dots, c^{(m)}, \mu_1, \dots, \mu_K)\}
$$
$$
\text{Pick the clustering with the lowest cost } J
$$
## Choosing the number of clusters (K)
* Often, we want to get clusters for some later (downstream) purpose
* Evaluate K-means based on how ell it performs on that later purpose

For example, in a T-shirt size clustering algorithm:
* We could have K = 3 (Three sizes - S, M, L)
* Or, we could have K = 5 (Five sizes - XS, S, M, L, XL)
We need to compare both by evaluating them in the business perspective and decide which is better accordingly. For example, having 3 sizes rather than 5 has lower cost production and transportation wise. But, having 5 sizes gives a better fit for users and might satisfy them 

# Anomaly Detection
> Given a collection of events, finding unusual events is Anomaly Detection
## Gaussian (Normal) Distribution
$$
p(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x - \mu)^2}{2\sigma^2}}
$$
$$
\begin{aligned}
x &: \text{ A real-valued variable whose probability you're measuring} \\\\
\mu &: \text{ The mean of the distribution (the peak or center of the bell curve)} \\\\
\sigma^2 &: \text{ The variance, which controls how wide or narrow the bell curve is} \\\\
\sigma &: \text{ The standard deviation } \left( \sigma = \sqrt{\sigma^2} \right), \text{ representing how much variation exists from the mean} \\\\
\pi &: \text{ The mathematical constant } (\approx 3.14159)
\end{aligned}
$$

**Mean :**
$$
\mu = \frac{1}{m} \sum_{i=1}^{m} x^{(i)}
$$
**Variance:**
$$
\sigma^2 = \frac{1}{m} \sum_{i=1}^{m} \left( x^{(i)} - \mu \right)^2
$$
## Anomaly Detection Algorithm
1. Choose n features xᵢ that we think might be indicative of anomalous examples
2. Fit parameters μ₀, μ₁,...,μ$_n$ and σ$_1$, σ$_2$,..., σ$_n$
$$
\mu_j = \frac{1}{m} \sum_{i=1}^{m} x_j^{(i)}
$$
$$
\sigma_j^2 = \frac{1}{m} \sum_{i=1}^{m} \left( x_j^{(i)} - \mu_j \right)^2
$$
3. Given new example x, compute p(x):
$$
p(x) = \prod_{j=1}^{n} p(x_j; \mu_j, \sigma_j^2) = \prod_{j=1}^{n} \frac{1}{\sqrt{2\pi} \sigma_j} \exp\left( -\frac{(x_j - \mu_j)^2}{2\sigma_j^2} \right)
$$
$$
\text{Anomaly if}\quad p(x) < \varepsilon
$$
## Developing and evaluating an anomaly detection system
> Also known as real-number evaluation

* Have a few labelled data in the **Cross-validation** and **Test** sets of data. After fitting the anomaly detection model, evaluate it with the cross-validation and test sets to find out whether the algorithm is detecting the example as anomaly or not and compare this result with the label
* Use this evaluation to tune the epsilon(Threshold above which an entry is not an anomaly) value 
* Can possibly consider evaluation metrics like Precision/Recall also

## Anomaly Detection vs. supervised learning
**Anomaly detection**
* Can be preferred when having **very small** number of positive examples (y=1). (0-20 is common). Large number of negative (y=0) examples.
* Many different "types" of anomalies. Hard for any algorithm to learn from positive examples what the anomalies look like; future anomalies may look nothing like any of the anomalous examples we've seen so far
* Fraud detection
* Manufacturing - Finding new previously unseen defects in manufacturing
* Monitoring machines in a data center

**Supervised Learning** 
* Can be preferred when having **large** number of positive and negative examples 
* Enough positive examples for algorithm to get a sense of what positive examples are like, future positive examples likely to be similar to ones in training set
* Email spam classification
* Manufacturing - Finding known, previously seen defects
* Diseases classification
## Choosing what features to use
> More important task for anomaly detection
* The features must be **guassian** (Plotting the features should give a gaussian graph). If not, try to make them gaussian (Probably by using **np.log(x)** or **log(x +1)** or **sqrt(x)** etc.). These transformations makes the **anomaly detection** model better. Also, make sure to make the same transformation to cross-validation and testing data as well 
### Error analysis for anomaly detection
* Train a model, then see what anomalies in the cross-validation set that the algorithm is failing to detect. Then, look into those examples and see if that can inspire the creation of new features that would allow the model to spot that example which takes on unusually large or small value on  the new features and classify whether it's an anomaly or not

# Recommender System
* System with a set of users and items (Movie ratings for example)
![[ML - Recommender.png]]
$$
\begin{aligned}
&\text{Notation:} \\\\
&r(i,j) = 1 \quad \text{if user } j \text{ has rated movie } i \quad (0 \text{ otherwise}) \\\\
&y^{(i,j)} = \text{rating given by user } j \text{ on movie } i \\\\
&w^{(j)},\ b^{(j)} = \text{parameters for user } j \\\\
&x^{(i)} = \text{feature vector for movie } i \\\\
&m^{(j)} = \text{number of movies rated by user } j
\end{aligned}
$$
--- 
$$
\text{To learn parameters } w^{(j)}, b^{(j)} \text{ for user } j:
$$
$$
J(w^{(j)}, b^{(j)}) =
\frac{1}{2} \sum_{i: r(i,j)=1} \left( w^{(j)} \cdot x^{(i)} + b^{(j)} - y^{(i,j)} \right)^2 
+ \frac{\lambda}{2} \sum_{k=1}^{n} \left( w_k^{(j)} \right)^2
$$
---
$$
\text{To learn parameters } w^{(1)}, b^{(1)},\ w^{(2)}, b^{(2)},\ \ldots,\ w^{(n_u)}, b^{(n_u)} \text{ for all users:}
$$
$$
J\left( 
\begin{array}{c}
w^{(1)}, \ldots, w^{(n_u)} \\
b^{(1)}, \ldots, b^{(n_u)} 
\end{array}
\right)
=
\frac{1}{2} \sum_{j=1}^{n_u} \sum_{i: r(i,j)=1} 
\left( w^{(j)} \cdot x^{(i)} + b^{(j)} - y^{(i,j)} \right)^2 
+ \frac{\lambda}{2} \sum_{j=1}^{n_u} \sum_{k=1}^{n} \left( w_k^{(j)} \right)^2
$$

## Collaborative filtering algorithm
* In the above example, we've got two features x$_1$ and x$_2$ for each movie
* In some cases, let's say only the ratings are provided and the features aren't given. We have to find the features ourselves

**Cost function to learn w$^{j}$, b$^{j}$ for all users**
$$
\min_{w^{(1)},\ldots,w^{(n_u)},\ b^{(1)},\ldots,b^{(n_u)}}
\ \frac{1}{2} \sum_{j=1}^{n_u} \sum_{i: r(i,j) = 1} 
\left( w^{(j)} \cdot x^{(i)} + b^{(j)} - y^{(i,j)} \right)^2
+ \frac{\lambda}{2} \sum_{j=1}^{n_u} \sum_{k=1}^{n} \left( w_k^{(j)} \right)^2
$$
**Cost function to learn x$^{i}$ for all movies**
$$
\min_{x^{(1)},\ldots,x^{(n_m)}}
\ \frac{1}{2} \sum_{i=1}^{n_m} \sum_{j: r(i,j) = 1} 
\left( w^{(j)} \cdot x^{(i)} + b^{(j)} - y^{(i,j)} \right)^2
+ \frac{\lambda}{2} \sum_{i=1}^{n_m} \sum_{k=1}^{n} \left( x_k^{(i)} \right)^2
$$
**Combining both together**
$$
\min_{\substack{
w^{(1)},\ldots,w^{(n_u)} \\
b^{(1)},\ldots,b^{(n_u)} \\
x^{(1)},\ldots,x^{(n_m)}
}}
J(w, b, x)
=
\frac{1}{2} \sum_{(i,j):r(i,j)=1}
\left( w^{(j)} \cdot x^{(i)} + b^{(j)} - y^{(i,j)} \right)^2
+ \frac{\lambda}{2} \sum_{j=1}^{n_u} \sum_{k=1}^{n} \left( w_k^{(j)} \right)^2
+ \frac{\lambda}{2} \sum_{i=1}^{n_m} \sum_{k=1}^{n} \left( x_k^{(i)} \right)^2
$$
**We have to reduce the cost function. Gradient descent algorithm can be used for this purpose, the following are the updating steps in each iteration :**
$$
w_i^{(j)} = w_i^{(j)} - \alpha \frac{\partial}{\partial w_i^{(j)}} J(w, b, x)
$$
$$
b^{(j)} = b^{(j)} - \alpha \frac{\partial}{\partial b^{(j)}} J(w, b, x)
$$
$$
x_k^{(i)} = x_k^{(i)} - \alpha \frac{\partial}{\partial x_k^{(i)}} J(w, b, x)
$$
## Binary labels: favs, likes and clicks
**Binary prediction function :**
> Predict that the probability of y$^{(i,j)}$ = 1
$$
f_{(w,b,x)}(x) = g\left( w^{(j)} \cdot x^{(i)} + b^{(j)} \right)
$$
**Binary Cross-Entropy Loss for One Example:**
$$
L\left( f_{(w,b,x)}(x), y^{(i,j)} \right) 
= -y^{(i,j)} \log \left( f_{(w,b,x)}(x) \right) 
- (1 - y^{(i,j)}) \log \left( 1 - f_{(w,b,x)}(x) \right)
$$
**Total Cost Over All Observed Ratings:**
$$
J(w, b, x) = \sum_{(i,j):r(i,j)=1} 
L\left( f_{(w,b,x)}(x), y^{(i,j)} \right)
$$
# Recommender systems implementation
## Mean Normalization
![[ML - Mean Normalization.png]]
## TensorFlow implementation
 > Getting the derivative term of cost function with TensorFlow

**Gradient Descent**
 ```python3
 w = tf.Variable(3.0) # Tf.variables are the parameters we want to optimize
 x = 1.0
 y = 1.0 #target value
 alpha = 0.01

iterations = 30
for iter in range(iterations):
	# Use TensorFlow's Gradient tape to recored the steps
	# used to compute the cost J, to enable auto differentiation.
	with tf.GradientTape() as tape:
		fwb = w*x # Assuming b=0 for this example
		costJ = (fwb=y)**2

	# Use the gradient tape to calculate the gradients
	# of the cost with respect to the parameter w.
	[dJdw] = tape.gradient(costJ, [w])

	# Run one step of gradient descent by updating 
	# the value of w to reduce the cost.
	w.assign_add(-alpha * dJdw) # tf.variables require special function to modify
```

**Adam Optimizer algorithm**
```python3
# Instantiate an optimizer
optimizer = keras.optimizers.Adam(learning_rate = 1e-1)

iterations = 200
for iter in range(iterations):
	# Use TensorFlow's GradientTape to record
	# the operations used to compute the cost
	with tf.GradientTape() as tape:

		# Compute the cost (forward pass is included in cost)
		cost_value = cofiCostFuncV(X, W, B, Ynorm, R,
			num_users, num_movies, lambda)

	# Use the gradient tape to automatically retrieve the gradients of
	# the trainable variables with respect to the loss

	grads = tape.gradient(cost_vale, [x,W,b])

	# Run one step of gradient descent by updating the 
	# value of the variables to minimize the loss.
	optimizer.apply_gradients(zip(grads, [x,W,b]))
```

# Content-based filtering
## Collaborative filtering vs Content-based filtering

**Collaborative Filtering :** Recommend items to you based on ratings of users who gave similar ratings as you

**Content-based filtering :** Recommend items to you based on features of user and item to find good match. We'll still continue to make use of r(i, j) and y$^{(i,j)}$ 

**Example of the usr and movie features :**
![[ML - Content based filtering.png]]

## Deep learning for content-based filtering
![[ML - Content based filtering implementatin.png]]

**Learned user and item vectors:**
$$
\vec{v}_u^{(j)} \text{ is a vector of length 32 that describes user } j \text{ with features } \vec{x}_u^{(j)}
$$
$$
\vec{v}_m^{(i)} \text{ is a vector of length 32 that describes movie } i \text{ with features } \vec{x}_m^{(i)}
$$
$$
\text{To find movies similar to movie } i:
$$
$$
\left\| \vec{v}_m^{(k)} - \vec{v}_m^{(i)} \right\|^2 \quad \text{small}
$$
$$
\left\| \vec{x}_m^{(k)} - \vec{x}_m^{(i)} \right\|^2 \quad \text{small}
$$
$$
\text{Note: This can be pre-computed ahead of time}
$$
## Recommending from a large catelogue
How to efficiently find recommendation from a large set of items ? (It might be computationally inefficient to run neural network inference thousands of millions of times every time user shows up in a website )

Many large scale recommender systems are implemented in two steps as shown below:
**Retrieval :**
* Generate large list of plausible item candidates (For example,)
	1. For each of the last 10 movies watched by the user, find 10 most similar movies
	2. For most viewed 3 genres, find the top 10 movies
	3. Top 20 movies in the country
* Combine retrieved items into list, removing duplicates and items already watched/purchased

**Ranking :**
1. Take list retrieved and rank using learned model
2. Display ranked items to user

* Retrieving more items results in a better performance, but slower recommendations. Based on our preference, we need to do find a trade-off point between the two

# Principal Component Analysis
> Used for visualization, specifically for dataset with a lot of features that cannot be plotted easily. PCA takes thousands of features, reduces it to two or three and then help to plot the features

## PCA Algorithm
1. Find axis z(**Principal component**) to retain variance (info)
2. Find the projection points and use them as the new feature value
![[ML - PCA.png]]
* Given a z value, we can use **reconstruction** to find the original (x$_1$, x$_2$)
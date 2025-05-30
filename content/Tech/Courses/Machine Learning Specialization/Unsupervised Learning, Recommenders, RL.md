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


# Time and Space Complexity
**How to Analyze an Algorithm:**
1. Time
2. Space

**Example 1:**
```
Algorithm Swap(a,b)
{
   temp = a; ----> 1
   a = b;    ----> 1
   b = temp; ----> 1
}
```
We can write, 
* f(n) = 3
* S(n) = 3 (a->1; b->1; temp->1; Three variables used in total)
This can be interpreted as,
* ***Time complexity :** O(1) - Since 3 is a constant
* ***Space complexity :** O(1) - Since 3 is a constant
## Frequency Count Method
**Example 2:**
```
Algorithm Sum(A,n)
{
   S = 0;               ----> 1
   for(i=0; i<n; i++).  ----> n+1 (the i<n step runs n+1 times)
   {
      S = S + A[i];    ----> n
   }
      return S;            ----> 1
}

A = [8,3,9,7,2]
n = 5
```
* f(n) = 2n+3
* S(n) = n+3 (A->n; n->1; S->1; i->1)
* ***Time complexity :** O(n)
* ***Space complexity :** O(n)

**Example 3:**
```
# nxn matrix addition

Algorithm Add(A,B,n) 
{
   for(i=0; i<n; i++)                ---> n+1
   {
      for(j=0; j<n; j++)            ---> n x (n+1)
      {
        C[i,j] = A[i,j] + B[i,j]; ---> n x n
      }
   }
}
```
* f(n) = 2n$^2$ + 2n + 1
* S(n) = 3n$^2$ + 3 (A->n$^2$; B->n$^2$; C->n$^2$; n->1; i->1; j->1)
* ***Time complexity :** O(n$^2$)
* ***Space complexity :** O(n$^2$)

**Example 4:**
```
# nxn matrix multiplication

Algorithm Multipley(A,B,n)
{
	for(i=0; i<n; i++)                          --> n+1
	{
		for(j=0; j<n; j++)                      --> n x (n+1)
		{
			C[i,j] = 0;                         --> n x n
			for(k=0; k<n; k++)                  --> n x n x (n+1)
			{
			   C[i,j] = C[i,j] + A[i,k]*B[k,j]  --> n x n x n
			}
		}
	}
}
```
* f(n) = 2n$^3$ + 3n$^2$ + 2n + 1
* S(n) = 3n$^2$ + 4 (A->n$^2$; B->n$^2$; C->n$^2$; n->1; i->1; j->1, k->1)
* ***Time complexity :** O(n$^3$)
* ***Space complexity :** O(n$^2$)


# Introduction

```python3
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
	return {"message": "Hello World"}
```

* ***FastAPI** is a Python class that provides all the functionality for our API
* The ```@app.get("/)```is a **path operation decorator** (A decorator takes the function below and does something with it)
* In the above example, 
	* **path:** is ```/```
	* **operation:** is ```get```
	* **function:** is the function below the "decorator"


> [!info] Technical Details
FastAPI is a class that inherits directly from *Starlette* <br>
**Starlette** is a lightweight **ASGI** framework/toolkit, which is ideal for building async web services in Python <br>
**ASGI** (_Asynchronous Server Gateway Interface_) is a spiritual successor to **WSGI**(Web Server Gateway Interface), intended to provide a standard interface between async-capable Python web servers, frameworks, and applications.

**Common HTTP methods :**
==POST==: to create data
==GET==: to read data
==PUT==: to update data
==DELETE==: to delte data

# Dependencies

FastAPI has a very powerful and intuitive **Dependency Injection** system

* **Dependency Injection** means, in programming, that there is a way for our code (in our reference, the path operation functions) to declare things that it requires to work and use: "*dependencies*"
* And then, the system (FastAPI) will take care of doing whatever is needed to provide our code with those dependencies ("*inject*" the dependencies)
* Useful when we need to:
	* Have shared logic (Minimizes code repetition)
	* Share database connections
	* Enforce security, authentication, role requirements, etc.
* Any python **Callable** (Python class or function) can be declared as a Dependency

```python3
from fastapi import Depends,FastAPI #Imports Depends
```

### Dependencies with yield
* Dependencies can do some extra steps after finishing
* To do this, we use ```yield```, and write the extra steps (code) after
* We can use  ```yield``` one single time pr dependency
```python3
asynd def get_db():
	db = DBSession()
	try:
		yield db
	finally:
		db.close()
```
In the above code, only the code prior to and including the ```yield``` statement will execute before creating a response (The yielded value is what is injected into *path operations* and other dependencies)
* The code following the `yield` statement is executed after creating the response but before sending it


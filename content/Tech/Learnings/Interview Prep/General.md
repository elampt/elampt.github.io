# Basics of Python
Python is a **high-level**, **interpreted**, and **dynamically typed** programming language 
- **Dynamically typed** - No need to declare variable types (The data type of variable is determined at runtime, not during compilation)
- **Interpreted** - Executes line-by-line using an interpreter
- **Portable** - Can run on any OS with a Python interpreter

## How Python is Executed (Interpreter Workflow)
1. **Source Code (.py)**
	We write human-readable Python code
2. **Bytecode Compilation (.pyc)**
	Python compiles it internally to **bytecode** - platform-independent, lower-level code. This step is hidden from the user
3. **Python Virtual Machine (PVM)**
	The **PVM** (Python interpreter) executes the bytecode line-by-line

## How C Code is Executed (Compiler Workflow)
1. **Source Code (.c)**
2. **Compilation (Compiler)**
	Converts the code into **machine code** (binary) using a compiler like **gcc**
3. **Executable (.exe / a.out)**
	We get a platform-specific binary that runs directly on hardware - no interpreter needed


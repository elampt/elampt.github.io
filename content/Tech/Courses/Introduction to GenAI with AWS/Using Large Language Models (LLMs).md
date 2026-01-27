# LLM
> Advanced type of artificial intelligence model specializing in processing, understanding, and generating human language (They consist of a vast number of parameters - Parameters are aspects of model learned from training data enabling recognition, prediction and production of language)

**Transformer Architecture :** Most of the current LLMs are based on a machine learning approach called a Transformer Architecture, which allows for efficient processing of sequences of text and the ability to pay attention to different parts of the input when generating an output

## Model creation process
1. Data collection
2. Pre-processing
3. Model design
4. Model training
5. Computing Power
6. Additional Training
7. Deploy Model

## Using LLMs with PartyRock
> PartyRock -> Service provided by AWS that allows us to experiment with Amazon Bedrock
- When you give any prompt to PartyRock, it'll build an app in the background in Bedrock using foundational models and present it to you
## LLMs for Code Generation
> **CodeWhisperer** is a service in AWS. Given an text prompt, it'll generate code for us (Works natively with AWS Cloud9 and VS Code as well)
- Users simply input a comment describing the desired function.
- Amazon CodeWhisperer then uses autocomplete to suggest relevant code.

## Natural Language Models
> Branch of AI that combines computational linguistics (rule based modeling of human language) with statistical, machine learning, and deep learning models

### Key Processes in NLP
1. **Tokenization -** Breaking down text into smaller units (tokens), such as words or phrases, for easier analysis
2. **Parsing -** Analyzing the grammatical structure of sentences to understand how words relate to each other.
3. **Semantic Analysis -** Understanding the meaning behind words by considering context, synonyms, and ambiguities.
4. **Contextual Understanding -** Utilizing the context of surrounding sentences to enhance interpretation, including understanding implied meanings and intentions.
5. **Statistical Inference -** Using probabilities to predict subsequent words or appropriate responses in a conversation
6. **Machine Learning Integration -** Continuously learning from new inputs to improve language prediction and understanding

## Evolution of LLMs
1. **Rule-Based Systems -** Early models based on explicit grammatical and syntactic rules, limited and inflexible.
2. **Statistical Models -** Shifted to probability-based predictions, enabling more complex language processing.
3. **Machine Learning Models -** Began understanding context and patterns, but struggled with long-range dependencies.
4. **Neural Networks (RNNs and LSTMs) -** Improved handling of sequences and memory, marking significant progress.
5. **Transformer-Based Architectures -** Introduced attention mechanisms, allowing models to weigh the importance of each part of the sentence, thus capturing intricate relationships and context.

## How Large Language Models Work
1. **Transformer-Based Architectures** - These are types of neural network architectures that have become fundamental in state-of-the-art natural language processing (NLP) models. They're particularly adept at handling long sequences of data and learning complex patterns.
2. **Attention Mechanism** - A core concept in Transformer architectures. The attention mechanism, particularly self-attention, allows the model to weigh the importance of each word in a sentence in relation to every other word.
3. **Context Capture in Text** - Transformers are notable for their ability to capture context across long stretches of text. This is a significant advancement over rule-based, statistical, and traditional machine learning approaches.
4. **Tokenization** - The process of breaking down a sentence into tokens, which can be individual words or parts of words.
5. **Embeddings** - The numerical representations of words or tokens, typically in the form of vectors. Embeddings convert words into a format that can be processed by neural networks and other algorithms. They capture and quantify aspects of word meanings, their use in different contexts, and their syntactic roles.
6. **Self-Attention in Transformers** - This technique is used to calculate attention scores for each token, determining how much focus to put on other tokens in the sentence. It leads to a context-aware representation of each word.

## Encoders and Decoders
> In Transformer models, these are distinct components. The **encoder** processes the input text, converting it into numerical values known as embeddings. The **decoder** then uses these embeddings to generate output text.

### Decoding Strategies
- **Greedy Decoding** - Picks the most likely next word at each step. Efficient but can lead to suboptimal sequences.
- **Beam Search** - Tracks a number of possible sequences (beam width) to find a better sequence of words. It balances between the best local and overall choices.
- **Top-K Sampling** - Randomly picks the next word from the top K most likely candidates, introducing randomness and diversity.
- **Top-P (Nucleus) Sampling**: Chooses words from a set whose cumulative probability exceeds a threshold, focusing on high-probability options.

## Building LLMs with Code
**Tokenization** - The sentence is broken into tokens
```python3
# Tokenization using Hugging Face's Transformers 

from transformers import AutoTokenizer 

tokenizer = AutoTokenizer.from_pretrained("gpt-2") 
tokens = tokenizer.tokenize("A young girl named Alice sits bored by a riverbank...")
```

**Embedding -** Tokens are transformed into numerical vectors
```python3
# Embedding and Processing with a Transformer Model

from transformers import AutoModel 

model = AutoModel.from_pretrained("gpt-2") 
inputs = tokenizer("A young girl named Alice sits bored by a riverbank...", return_tensors="pt") 
outputs = model(**inputs) 
last_hidden_states = outputs.last_hidden_state
```

1. **Self-Attention -** The model calculates attention scores for each token, understanding their importance in context.
2. **Layered Processing -** Multiple neural network layers process these embeddings, enhancing understanding at each step.
3. **Encoders and Decoders -** The encoder processes input text into embeddings, and the decoder generates output text, using strategies like Greedy Decoding or Beam Search.

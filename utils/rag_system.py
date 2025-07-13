OPENAI_API_KEY = "OPENAI_API_KEY"

from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI

# behran
def behran_rag(query):
    embedding_function = OpenAIEmbeddings(
        openai_api_key = OPENAI_API_KEY
    )
    db = FAISS.load_local(r"vectordb\behran", embedding_function, allow_dangerous_deserialization=True)
    retriever = db.as_retriever()
    llm = ChatOpenAI(
        model = "gpt-4o-mini",
        temperature = 0.0)
    relevant_docs = retriever.invoke(query, k=3)
    docs_content = []
    for element in relevant_docs:
        docs_content.append(element.page_content)
    prompt = f"""
این ورودی کاربر هستش
{query}

این اطلاعاتی هستش که بازیابی شده
{docs_content}

بر اساس اطلاعات بازیابی شده، پاسخ به کوئری کاربر بنویس
"""

    response = llm.invoke(prompt).content
    return response

# sina
def sina_rag(query):
    embedding_function = OpenAIEmbeddings(
        openai_api_key = OPENAI_API_KEY
    )
    db = FAISS.load_local(r"vectordb\sina", embedding_function, allow_dangerous_deserialization=True)
    retriever = db.as_retriever()
    llm = ChatOpenAI(
        # model = "gpt-4o-mini",
        model = "gpt-4.1-nano-2025-04-14",
        temperature = 0.0)
    relevant_docs = retriever.invoke(query, k=3)
    docs_content = []
    for element in relevant_docs:
        docs_content.append(element.page_content)
    prompt = f"""
این ورودی کاربر هستش
{query}

این اطلاعاتی هستش که بازیابی شده
{docs_content}

بر اساس اطلاعات بازیابی شده، پاسخ به کوئری کاربر بنویس
"""
    response = llm.invoke(prompt).content
    return response

# irantire
def irantire_rag(query):
    embedding_function = OpenAIEmbeddings(
        openai_api_key = OPENAI_API_KEY
    )
    db = FAISS.load_local(r"vectordb\irantire", embedding_function, allow_dangerous_deserialization=True)
    retriever = db.as_retriever()
    llm = ChatOpenAI(
        model = "gpt-4o-mini",
        temperature = 0.0)
    relevant_docs = retriever.invoke(query, k=3)
    docs_content = []
    for element in relevant_docs:
        docs_content.append(element.page_content)
    prompt = f"""
این ورودی کاربر هستش
{query}

این اطلاعاتی هستش که بازیابی شده
{docs_content}

بر اساس اطلاعات بازیابی شده، پاسخ به کوئری کاربر بنویس
"""
    response = llm.invoke(prompt).content
    return response

# companies
def companies_rag(query):
    embedding_function = OpenAIEmbeddings(
        openai_api_key = OPENAI_API_KEY
    )
    db = FAISS.load_local(r"vectordb\companies", embedding_function, allow_dangerous_deserialization=True)
    retriever = db.as_retriever()
    llm = ChatOpenAI(
        model = "gpt-4o-mini",
        temperature = 0.0)
    relevant_docs = retriever.invoke(query, k=3)
    docs_content = []
    for element in relevant_docs:
        docs_content.append(element.page_content)
    prompt = f"""
این ورودی کاربر هستش
{query}

این اطلاعاتی هستش که بازیابی شده
{docs_content}

بر اساس اطلاعات بازیابی شده، پاسخ به کوئری کاربر بنویس
"""
    response = llm.invoke(prompt).content
    return response
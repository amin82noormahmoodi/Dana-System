from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from config import settings

class RAGSystem:
    def __init__(self):
        self.embedding_function = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.0,
            openai_api_key=settings.OPENAI_API_KEY
        )

    def _get_response(self, query: str, db_path: str) -> str:
        """Get response from RAG system"""
        db = FAISS.load_local(db_path, self.embedding_function, allow_dangerous_deserialization=True)
        retriever = db.as_retriever()
        relevant_docs = retriever.invoke(query, k=15)
        docs_content = [element.page_content for element in relevant_docs]
        
        prompt = f"""
{query}

این اطلاعاتی هستش که بازیابی شده
{docs_content}

بر اساس اطلاعات بازیابی شده، پاسخ به کوئری کاربر بنویس
"""     
        print(f"################################### {prompt} ###################################")
        response = self.llm.invoke(prompt).content
        return response

    def behran_rag(self, query: str) -> str:
        """RAG for Behran company"""
        query = f"""
لطفا به سوالات کاربر پاسخ بده
اگر کاربر سوالات یا ورودی های نامربوط مثل ضصخگهبدصثبخهدضصثب یا qoweufqwo;efbweff فرستاد جواب مناسب بده و بگو لطفا سوال مناسب بپرسید و فقط هم همین رو بگی و چیز دیگه ای نگی
سعی کن جواب های مرتبط به سوال کاربر بدی و دیتایی که داری در پاسخت استفاده میکنی از اطلاعات بازیابی شده باشه
شرکت نفت بهران یکی از بزرگ‌ترین تولیدکنندگان روغن‌های موتور و صنعتی در ایران است که در زمینه تولید و عرضه روانکارها، گریس و فرآورده‌های نفتی فعالیت می‌کند.

این ورودی کاربر هستش
{query}
"""
        return self._get_response(query, r"..\vectordb\behran")

    def sina_rag(self, query: str) -> str:
        """RAG for Sina company"""
        query = f"""
لطفا به سوالات کاربر پاسخ بده
اگر کاربر سوالات یا ورودی های نامربوط مثل ضصخگهبدصثبخهدضصثب یا qoweufqwo;efbweff فرستاد جواب مناسب بده و بگو لطفا سوال مناسب بپرسید و فقط هم همین رو بگی و چیز دیگه ای نگی
سعی کن جواب های مرتبط به سوال کاربر بدی و دیتایی که داری در پاسخت استفاده میکنی از اطلاعات بازیابی شده باشه
بانک سینا یک بانک خصوصی ایرانی است که خدمات مالی و بانکی مانند سپرده‌گذاری، اعطای وام و بانکداری الکترونیک ارائه می‌دهد.

این ورودی کاربر هستش
{query}
"""
        return self._get_response(query, r"..\vectordb\sina")

    def irantire_rag(self, query: str) -> str:
        """RAG for Iran Tire company"""
        query = f"""
لطفا به سوالات کاربر پاسخ بده
اگر کاربر سوالات یا ورودی های نامربوط مثل ضصخگهبدصثبخهدضصثب یا qoweufqwo;efbweff فرستاد جواب مناسب بده و بگو لطفا سوال مناسب بپرسید و فقط هم همین رو بگی و چیز دیگه ای نگی
سعی کن جواب های مرتبط به سوال کاربر بدی و دیتایی که داری در پاسخت استفاده میکنی از اطلاعات بازیابی شده باشه
شرکت ایران تایر یک تولیدکننده ایرانی انواع لاستیک‌های سبک و سنگین (سواری، وانت، باری، کشاورزی و راه‌سازی) است

این ورودی کاربر هستش
{query}
"""
        return self._get_response(query, r"..\vectordb\irantire")

    def companies_rag(self, query: str) -> str:
        """RAG for all companies"""
        query = f"""
لطفا به سوالات کاربر پاسخ بده
اگر کاربر سوالات یا ورودی های نامربوط مثل ضصخگهبدصثبخهدضصثب یا qoweufqwo;efbweff فرستاد جواب مناسب بده و بگو لطفا سوال مناسب بپرسید و فقط هم همین رو بگی و چیز دیگه ای نگی
سعی کن جواب های مرتبط به سوال کاربر بدی و دیتایی که داری در پاسخت استفاده میکنی از اطلاعات بازیابی شده باشه
برای مثال وقتی کاربر میگه در مورد چه شرکت هایی اطلاعات داری باید فقط اسم شرکت های بانک سینا، شرکت ایران تایر و شرکت نفت بهران رو بگی
شرکت نفت بهران یکی از بزرگ‌ترین تولیدکنندگان روغن‌های موتور و صنعتی در ایران است که در زمینه تولید و عرضه روانکارها، گریس و فرآورده‌های نفتی فعالیت می‌کند.
بانک سینا یک بانک خصوصی ایرانی است که خدمات مالی و بانکی مانند سپرده‌گذاری، اعطای وام و بانکداری الکترونیک ارائه می‌دهد.
شرکت ایران تایر یک تولیدکننده ایرانی انواع لاستیک‌های سبک و سنگین (سواری، وانت، باری، کشاورزی و راه‌سازی) است

این ورودی کاربر هستش
{query}
"""
        print("################################### MODIR ###################################")
        return self._get_response(query, r"..\vectordb\companies")

rag_system = RAGSystem() 
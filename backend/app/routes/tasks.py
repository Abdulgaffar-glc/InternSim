from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# --- Proje İçi Importlar ---
# Dosya yollarını senin attığın görsele göre ayarladım
from backend.app.db_dep import get_db
from backend.app.auth_dep import get_current_user
from backend.app.models.task import Task
from backend.app.models.internship import Internship

# Logic'i ayırdığımız servis dosyasını çağırıyoruz
from backend.app.services.task_agent import generate_task 

load_dotenv()

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/new")
def create_new_task(db: Session = Depends(get_db),
                    user = Depends(get_current_user)):
    """
    Kullanıcının aktif stajına göre yeni bir yapay zeka destekli görev oluşturur.
    Veritabanındaki 'tasks' tablosuna (title, description, difficulty) uygun kayıt atar.
    """
    
    # 1. Kullanıcının aktif stajını (internship) bul
    internship = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    # Eğer aktif staj yoksa işlem yapamayız
    if not internship:
        raise HTTPException(status_code=404, detail="Aktif bir staj bulunamadı.")

    # 2. AI Servisini Çağır (task_agent.py içindeki fonksiyon)
    # Bu fonksiyon bize { "title": "...", "description": "...", "difficulty": "..." } dönecek.
    try:
        # Internship tablosundaki 'track' (alan) ve 'level' (seviye) bilgisini gönderiyoruz
        ai_data = generate_task(track=internship.track, level=internship.level)
        
    except Exception as e:
        # AI servisinde bir hata olursa 500 dönüyoruz
        print(f"Service Error: {e}")
        raise HTTPException(status_code=500, detail="AI servisi şu an yanıt veremiyor.")

    # 3. Veritabanı Nesnesini Oluştur (Mapping)
    # Arkadaşının veritabanı şemasına %100 uyumlu hale getirdik.
    new_task = Task(
        internship_id=internship.id,
        title=ai_data.get("title", "Generated Task"),       # DB: title
        description=ai_data.get("description", ""),         # DB: description
        difficulty=ai_data.get("difficulty", internship.level), # DB: difficulty
        status="active"                                     # DB: status
    )

    # 4. Kaydet ve Döndür
    try:
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return new_task
        
    except Exception as e:
        db.rollback()
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Veritabanına kayıt sırasında hata oluştu.")


@router.get("/list")
def list_tasks(db: Session = Depends(get_db),
               user = Depends(get_current_user)):
    """
    Kullanıcının aktif stajına ait tüm görevleri listeler.
    """
    internship = db.query(Internship).filter(
        Internship.user_id == user["sub"],
        Internship.status == "active"
    ).first()

    if not internship:
        return []

    # O staja ait görevleri, en yeni en üstte olacak şekilde getir
    tasks = db.query(Task).filter(
        Task.internship_id == internship.id
    ).order_by(Task.created_at.desc()).all()

    return tasks
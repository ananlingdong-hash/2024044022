from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger


scheduler = BackgroundScheduler(timezone="Asia/Shanghai")


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)


def upsert_job(job_id: str, cron_expr: str, task_callable) -> None:
    trigger = CronTrigger.from_crontab(cron_expr)
    scheduler.add_job(task_callable, trigger=trigger, id=job_id, replace_existing=True)

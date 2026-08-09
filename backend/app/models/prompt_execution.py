"""
Prompt Execution model: an immutable history record of one AI generation
run for a given Prompt (input sent, output received, model + token usage).
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel


class PromptExecution(BaseModel):
    __tablename__ = "prompt_executions"

    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    model = Column(String(100), nullable=False)
    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=True)
    tokens_used = Column(Integer, nullable=True)

    # completed | failed - lets a failed AI call still be recorded for audit
    # purposes without pretending output_text/tokens_used exist for it.
    status = Column(String(20), nullable=False, default="completed")
    error_message = Column(Text, nullable=True)

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Wireframe(db.Model):
    """Model for storing wireframe data and metadata."""
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    prompt = db.Column(db.Text, nullable=False)
    wireframe_data = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = db.Column(db.Integer, default=1)
    parent_id = db.Column(db.Integer, db.ForeignKey('wireframe.id'), nullable=True)
    
    # Relationships
    children = db.relationship('Wireframe', backref=db.backref('parent', remote_side=[id]))
    
    def __init__(self, title, description, prompt, wireframe_data, parent_id=None):
        self.title = title
        self.description = description
        self.prompt = prompt
        self.wireframe_data = json.dumps(wireframe_data) if isinstance(wireframe_data, dict) else wireframe_data
        self.parent_id = parent_id
        
        # Set version based on parent
        if parent_id:
            parent = Wireframe.query.get(parent_id)
            if parent:
                self.version = parent.version + 1
    
    def get_wireframe_data(self):
        """Return wireframe data as a Python dictionary."""
        try:
            return json.loads(self.wireframe_data)
        except json.JSONDecodeError:
            return {}
    
    def set_wireframe_data(self, data):
        """Set wireframe data from a Python dictionary."""
        self.wireframe_data = json.dumps(data)
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert wireframe to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'prompt': self.prompt,
            'wireframe_data': self.get_wireframe_data(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'version': self.version,
            'parent_id': self.parent_id
        }
    
    @classmethod
    def create_wireframe(cls, title, description, prompt, wireframe_data, parent_id=None):
        """Create a new wireframe and save to database."""
        wireframe = cls(title, description, prompt, wireframe_data, parent_id)
        db.session.add(wireframe)
        db.session.commit()
        return wireframe
    
    @classmethod
    def get_wireframe_history(cls, wireframe_id):
        """Get the version history of a wireframe."""
        wireframe = cls.query.get(wireframe_id)
        if not wireframe:
            return []
        
        # Get the root wireframe
        root_id = wireframe.id
        while wireframe.parent_id:
            wireframe = cls.query.get(wireframe.parent_id)
            root_id = wireframe.id
        
        # Get all versions starting from root
        versions = cls.query.filter_by(parent_id=root_id).order_by(cls.version.asc()).all()
        if not versions:
            versions = [cls.query.get(root_id)]
        
        return [v.to_dict() for v in versions]
    
    @classmethod
    def get_latest_wireframes(cls, limit=10):
        """Get the most recently created wireframes."""
        wireframes = cls.query.order_by(cls.created_at.desc()).limit(limit).all()
        return [w.to_dict() for w in wireframes]

class WireframeTemplate(db.Model):
    """Model for storing wireframe templates."""
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    prompt_template = db.Column(db.Text, nullable=False)
    sample_data = db.Column(db.Text)  # JSON string of sample wireframe data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __init__(self, name, description, category, prompt_template, sample_data=None):
        self.name = name
        self.description = description
        self.category = category
        self.prompt_template = prompt_template
        self.sample_data = json.dumps(sample_data) if isinstance(sample_data, dict) else sample_data
    
    def get_sample_data(self):
        """Return sample data as a Python dictionary."""
        try:
            return json.loads(self.sample_data) if self.sample_data else {}
        except json.JSONDecodeError:
            return {}
    
    def to_dict(self):
        """Convert template to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'prompt_template': self.prompt_template,
            'sample_data': self.get_sample_data(),
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
    
    @classmethod
    def get_active_templates(cls):
        """Get all active templates."""
        templates = cls.query.filter_by(is_active=True).order_by(cls.name.asc()).all()
        return [t.to_dict() for t in templates]
    
    @classmethod
    def get_templates_by_category(cls, category):
        """Get templates by category."""
        templates = cls.query.filter_by(category=category, is_active=True).order_by(cls.name.asc()).all()
        return [t.to_dict() for t in templates]


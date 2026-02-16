#!/usr/bin/env python3
"""
Ontology Editor API Server

Flask REST API for the ontology editor application.
Provides endpoints for class, property, and instance management.
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import logging
from datetime import datetime
from typing import Dict, Any
from src.services.ontology_service import OntologyService
from src.services.ontology_models import (
    OntologyClass,
    OntologyProperty,
    OntologyInstance,
    PropertyType,
    PropertyCharacteristic,
)
from src.services.base_service import (
    NodeNotFoundError,
    ValidationError,
    InvalidOperationError,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize ontology service (lazy initialization to avoid startup hang)
ontology_service = None

def init_demo_data(service):
    """Initialize demo data if ontology is empty"""
    from src.services.ontology_models import (
        OntologyClass, OntologyProperty, OntologyInstance,
        PropertyType, XSDDatatype
    )
    
    # Check if already initialized (more than just owl:Thing)
    if len(service.get_all_classes()) > 1:
        logger.info("Demo data already exists, skipping initialization")
        return
    
    logger.info("Initializing demo data...")
    
    try:
        # Create classes
        service.create_class(OntologyClass(
            id="demo:Person", label="Person",
            description="A human being",
            parent_classes=["owl:Thing"]
        ))
        service.create_class(OntologyClass(
            id="demo:Professor", label="Professor",
            description="A university professor",
            parent_classes=["demo:Person"]
        ))
        service.create_class(OntologyClass(
            id="demo:Student", label="Student",
            description="A university student",
            parent_classes=["demo:Person"]
        ))
        service.create_class(OntologyClass(
            id="demo:Employee", label="Employee",
            description="An employee",
            parent_classes=["demo:Person"]
        ))
        
        # Create properties
        service.create_property(OntologyProperty(
            id="demo:name", label="name",
            property_type=PropertyType.DATA,
            domain=["demo:Person"],
            range=[str(XSDDatatype.STRING)],
            annotations={"required": "true"}
        ))
        service.create_property(OntologyProperty(
            id="demo:email", label="email",
            property_type=PropertyType.DATA,
            domain=["demo:Person"],
            range=[str(XSDDatatype.STRING)],
            annotations={"required": "true"}
        ))
        service.create_property(OntologyProperty(
            id="demo:department", label="department",
            property_type=PropertyType.DATA,
            domain=["demo:Professor"],
            range=[str(XSDDatatype.STRING)],
            annotations={"required": "true"}
        ))
        service.create_property(OntologyProperty(
            id="demo:student_id", label="student_id",
            property_type=PropertyType.DATA,
            domain=["demo:Student"],
            range=[str(XSDDatatype.STRING)],
            annotations={"required": "true"}
        ))
        
        # Create instances
        service.create_instance(OntologyInstance(
            id="demo:prof_smith",
            label="Professor Smith",
            class_ids=["demo:Professor"],
            properties={
                "demo:name": "Dr. John Smith",
                "demo:email": "john.smith@university.edu",
                "demo:department": "Computer Science"
            }
        ))
        service.create_instance(OntologyInstance(
            id="demo:student_jones",
            label="Student Jones",
            class_ids=["demo:Student"],
            properties={
                "demo:name": "Alice Jones",
                "demo:email": "alice.jones@university.edu",
                "demo:student_id": "S12345"
            }
        ))
        
        logger.info(f"Demo data initialized: {len(service.get_all_classes())} classes")
    except Exception as e:
        logger.warning(f"Error initializing demo data: {e}")

def get_ontology_service():
    """Get or create ontology service instance"""
    global ontology_service
    if ontology_service is None:
        logger.info("Initializing ontology service...")
        ontology_service = OntologyService()
        logger.info("Ontology service initialized successfully")
        init_demo_data(ontology_service)
    return ontology_service


# ============================================================================
# Helper Functions
# ============================================================================

def success_response(data: Any, message: str = "Success") -> Dict:
    """Create success response"""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }


def error_response(error: str, status_code: int = 400) -> tuple:
    """Create error response"""
    return jsonify({
        "success": False,
        "error": error,
        "timestamp": datetime.utcnow().isoformat()
    }), status_code


# ============================================================================
# Class Endpoints
# ============================================================================

@app.route('/api/ontology/classes', methods=['GET'])
def get_classes():
    """Get all ontology classes"""
    try:
        classes = get_ontology_service().get_all_classes()
        return jsonify(success_response([
            {
                "id": c.id,
                "label": c.label,
                "description": c.description,
                "parent_classes": c.parent_classes,
                "is_abstract": c.is_abstract
            } for c in classes
        ]))
    except Exception as e:
        logger.error(f"Error getting classes: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>', methods=['GET'])
def get_class(class_id: str):
    """Get specific class"""
    try:
        class_obj = get_ontology_service().get_class(class_id)
        return jsonify(success_response({
            "id": class_obj.id,
            "label": class_obj.label,
            "description": class_obj.description,
            "parent_classes": class_obj.parent_classes,
            "equivalent_classes": class_obj.equivalent_classes,
            "disjoint_classes": class_obj.disjoint_classes,
            "is_abstract": class_obj.is_abstract
        }))
    except NodeNotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        logger.error(f"Error getting class {class_id}: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes', methods=['POST'])
def create_class():
    """Create new class"""
    try:
        data = request.get_json()
        
        class_obj = OntologyClass(
            id=data['id'],
            label=data.get('label', data['id']),
            description=data.get('description'),
            parent_classes=data.get('parent_classes', []),
            equivalent_classes=data.get('equivalent_classes', []),
            disjoint_classes=data.get('disjoint_classes', []),
            is_abstract=data.get('is_abstract', False)
        )
        
        created = get_ontology_service().create_class(class_obj)
        
        return jsonify(success_response({
            "id": created.id,
            "label": created.label,
            "description": created.description,
            "parent_classes": created.parent_classes
        }, "Class created successfully"))
    
    except ValidationError as e:
        return error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error creating class: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>', methods=['DELETE'])
def delete_class(class_id: str):
    """Delete a class"""
    try:
        force = request.args.get('force', 'false').lower() == 'true'
        get_ontology_service().delete_class(class_id, force=force)
        return jsonify(success_response(None, f"Class '{class_id}' deleted"))
    except (NodeNotFoundError, InvalidOperationError) as e:
        return error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error deleting class {class_id}: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>/subclasses', methods=['GET'])
def get_subclasses(class_id: str):
    """Get subclasses of a class"""
    try:
        direct_only = request.args.get('direct', 'false').lower() == 'true'
        subclasses = get_ontology_service().get_subclasses(class_id, direct_only=direct_only)
        return jsonify(success_response([
            {"id": c.id, "label": c.label, "description": c.description}
            for c in subclasses
        ]))
    except Exception as e:
        logger.error(f"Error getting subclasses: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>/superclasses', methods=['GET'])
def get_superclasses(class_id: str):
    """Get superclasses of a class"""
    try:
        direct_only = request.args.get('direct', 'false').lower() == 'true'
        superclasses = get_ontology_service().get_superclasses(class_id, direct_only=direct_only)
        return jsonify(success_response([
            {"id": c.id, "label": c.label, "description": c.description}
            for c in superclasses
        ]))
    except Exception as e:
        logger.error(f"Error getting superclasses: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>/full', methods=['GET'])
def get_class_full(class_id: str):
    """Get class with complete inheritance information"""
    try:
        class_full = get_ontology_service().get_class_full(class_id)
        return jsonify(success_response(class_full))
    except NodeNotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        logger.error(f"Error getting full class info: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/hierarchy', methods=['GET'])
def get_hierarchy():
    """Get class hierarchy tree"""
    try:
        root_id = request.args.get('root', 'owl:Thing')
        hierarchy = get_ontology_service().get_class_hierarchy(root_id)
        
        def serialize_hierarchy(node):
            return {
                "class_id": node.class_id,
                "label": node.label,
                "parent_id": node.parent_id,
                "instance_count": node.instance_count,
                "depth": node.depth,
                "children": [serialize_hierarchy(child) for child in node.children]
            }
        
        return jsonify(success_response(serialize_hierarchy(hierarchy)))
    except Exception as e:
        logger.error(f"Error getting hierarchy: {e}", exc_info=True)
        return error_response(str(e), 500)


# ============================================================================
# Property Endpoints
# ============================================================================

@app.route('/api/ontology/properties', methods=['GET'])
def get_properties():
    """Get all ontology properties"""
    try:
        properties = get_ontology_service().get_all_properties()
        return jsonify(success_response([
            {
                "id": p.id,
                "label": p.label,
                "property_type": p.property_type.value,
                "description": p.description,
                "domain": p.domain,
                "range": p.range
            } for p in properties
        ]))
    except Exception as e:
        logger.error(f"Error getting properties: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/properties/<property_id>', methods=['GET'])
def get_property(property_id: str):
    """Get specific property"""
    try:
        prop = get_ontology_service().get_property(property_id)
        return jsonify(success_response({
            "id": prop.id,
            "label": prop.label,
            "property_type": prop.property_type.value,
            "description": prop.description,
            "domain": prop.domain,
            "range": prop.range,
            "inverse_of": prop.inverse_of,
            "characteristics": [c.value for c in prop.characteristics]
        }))
    except NodeNotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        logger.error(f"Error getting property {property_id}: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/properties', methods=['POST'])
def create_property():
    """Create new property"""
    try:
        data = request.get_json()
        
        # Parse property type
        prop_type = PropertyType(data.get('property_type', 'object'))
        
        # Parse characteristics
        characteristics = set()
        for char in data.get('characteristics', []):
            try:
                characteristics.add(PropertyCharacteristic(char))
            except ValueError:
                pass
        
        prop_obj = OntologyProperty(
            id=data['id'],
            label=data.get('label', data['id']),
            property_type=prop_type,
            description=data.get('description'),
            domain=data.get('domain', []),
            range=data.get('range', []),
            inverse_of=data.get('inverse_of'),
            characteristics=characteristics
        )
        
        created = get_ontology_service().create_property(prop_obj)
        
        return jsonify(success_response({
            "id": created.id,
            "label": created.label,
            "property_type": created.property_type.value,
            "description": created.description
        }, "Property created successfully"))
    
    except ValidationError as e:
        return error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error creating property: {e}", exc_info=True)
        return error_response(str(e), 500)


# ============================================================================
# Instance Endpoints
# ============================================================================

@app.route('/api/ontology/instances', methods=['POST'])
def create_instance():
    """Create new instance"""
    try:
        data = request.get_json()
        
        instance_obj = OntologyInstance(
            id=data['id'],
            label=data.get('label', data['id']),
            class_ids=data.get('class_ids', []),
            properties=data.get('properties', {})
        )
        
        # Validate properties against class requirements (including inheritance)
        validation_errors = []
        for class_id in instance_obj.class_ids:
            try:
                errors = get_ontology_service().validate_instance_properties(
                    class_id, 
                    instance_obj.properties
                )
                validation_errors.extend(errors)
            except Exception as e:
                logger.warning(f"Could not validate against class {class_id}: {e}")
        
        if validation_errors:
            return jsonify({
                "success": False,
                "error": "Validation failed",
                "details": validation_errors,
                "timestamp": datetime.utcnow().isoformat()
            }), 422
        
        created = get_ontology_service().create_instance(instance_obj)
        
        return jsonify(success_response({
            "id": created.id,
            "label": created.label,
            "class_ids": created.class_ids,
            "properties": created.properties
        }, "Instance created successfully"))
    
    except ValidationError as e:
        return error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error creating instance: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/instances/<instance_id>', methods=['GET'])
def get_instance(instance_id: str):
    """Get specific instance"""
    try:
        inst = get_ontology_service().get_instance(instance_id)
        return jsonify(success_response({
            "id": inst.id,
            "label": inst.label,
            "class_ids": inst.class_ids,
            "properties": inst.properties
        }))
    except NodeNotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        logger.error(f"Error getting instance {instance_id}: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/classes/<class_id>/instances', methods=['GET'])
def get_class_instances(class_id: str):
    """Get all instances of a class"""
    try:
        direct_only = request.args.get('direct', 'true').lower() == 'true'
        instances = get_ontology_service().get_instances_of_class(class_id, direct_only=direct_only)
        return jsonify(success_response([
            {
                "id": i.id,
                "label": i.label,
                "class_ids": i.class_ids
            } for i in instances
        ]))
    except Exception as e:
        logger.error(f"Error getting instances: {e}", exc_info=True)
        return error_response(str(e), 500)


# ============================================================================
# Reasoning & Analysis Endpoints
# ============================================================================

@app.route('/api/ontology/reasoning/consistency', methods=['GET'])
def check_consistency():
    """Check ontology consistency"""
    try:
        result = get_ontology_service().check_consistency()
        return jsonify(success_response({
            "consistent": result.consistent,
            "errors": result.errors,
            "warnings": result.warnings,
            "reasoning_time": result.reasoning_time
        }))
    except Exception as e:
        logger.error(f"Error checking consistency: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/statistics', methods=['GET'])
def get_statistics():
    """Get ontology statistics"""
    try:
        stats = get_ontology_service().get_statistics()
        return jsonify(success_response({
            "total_classes": stats.total_classes,
            "total_properties": stats.total_properties,
            "total_instances": stats.total_instances,
            "total_object_properties": stats.total_object_properties,
            "total_data_properties": stats.total_data_properties,
            "total_annotation_properties": stats.total_annotation_properties,
            "max_hierarchy_depth": stats.max_hierarchy_depth
        }))
    except Exception as e:
        logger.error(f"Error getting statistics: {e}", exc_info=True)
        return error_response(str(e), 500)


@app.route('/api/ontology/validate', methods=['GET'])
def validate_ontology():
    """Validate ontology structure"""
    try:
        result = get_ontology_service().validate_ontology()
        return jsonify(success_response({
            "valid": result.valid,
            "errors": result.errors,
            "warnings": result.warnings
        }))
    except Exception as e:
        logger.error(f"Error validating ontology: {e}", exc_info=True)
        return error_response(str(e), 500)


# ============================================================================
# Utility Endpoints
# ============================================================================

@app.route('/api/ontology/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify(success_response({
        "status": "healthy",
        "service": "Ontology Editor API",
        "version": "1.0.0"
    }))


@app.route('/')
def index():
    """Render main page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ontology Editor API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #2c3e50; }
            .endpoint { background: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 3px solid #3498db; }
            code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🧠 Ontology Editor API</h1>
        <p>RESTful API for semantic ontology management</p>
        
        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
            <strong>GET /api/ontology/classes</strong> - List all classes
        </div>
        <div class="endpoint">
            <strong>POST /api/ontology/classes</strong> - Create new class
        </div>
        <div class="endpoint">
            <strong>GET /api/ontology/classes/{id}</strong> - Get class details
        </div>
        <div class="endpoint">
            <strong>GET /api/ontology/hierarchy</strong> - Get class hierarchy
        </div>
        <div class="endpoint">
            <strong>GET /api/ontology/properties</strong> - List all properties
        </div>
        <div class="endpoint">
            <strong>POST /api/ontology/properties</strong> - Create new property
        </div>
        <div class="endpoint">
            <strong>POST /api/ontology/instances</strong> - Create new instance
        </div>
        <div class="endpoint">
            <strong>GET /api/ontology/statistics</strong> - Get ontology stats
        </div>
        <div class="endpoint">
            <strong>GET /api/ontology/reasoning/consistency</strong> - Check consistency
        </div>
        
        <h2>Quick Start</h2>
        <p>Create a class:</p>
        <pre><code>curl -X POST http://localhost:5002/api/ontology/classes \\
  -H "Content-Type: application/json" \\
  -d '{"id": "Person", "label": "Person", "description": "A human being"}'</code></pre>
        
        <h2>Documentation</h2>
        <p>See <code>ONTOLOGY_EDITOR_PRODUCT.md</code> for full documentation</p>
    </body>
    </html>
    """


if __name__ == '__main__':
    logger.info("Starting Ontology Editor API server...")
    logger.info("Server running at http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)

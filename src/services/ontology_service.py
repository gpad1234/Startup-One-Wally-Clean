"""
Ontology Service

Service layer for ontology operations, built on top of GraphService.
Provides semantic capabilities like class hierarchies, properties, and reasoning.
"""

from typing import List, Optional, Dict, Any, Set
from src.services.graph_service import GraphService
from src.services.base_service import (
    NodeNotFoundError,
    ValidationError,
    InvalidOperationError,
)
from src.services.ontology_models import (
    OntologyClass,
    OntologyProperty,
    OntologyInstance,
    ClassHierarchy,
    PropertyHierarchy,
    ReasoningResult,
    OntologyStats,
    OntologyMetadata,
    OntologySearchResult,
    ValidationResult,
    PropertyType,
    PropertyCharacteristic,
    XSDDatatype,
)
from graph_db import GraphDB


class OntologyService:
    """
    Service for ontology operations
    
    Built on graph database, adds semantic web capabilities:
    - Class hierarchies with inheritance
    - Properties with domains, ranges, and characteristics
    - Instances with type checking
    - Basic reasoning and inference
    """
    
    # Special node/edge labels for ontology elements
    CLASS_TYPE = "owl:Class"
    PROPERTY_TYPE = "owl:Property"
    INSTANCE_TYPE = "owl:Individual"
    SUBCLASS_RELATION = "rdfs:subClassOf"
    SUBPROPERTY_RELATION = "rdfs:subPropertyOf"
    TYPE_RELATION = "rdf:type"
    DOMAIN_RELATION = "rdfs:domain"
    RANGE_RELATION = "rdfs:range"
    
    def __init__(self, graph_db: Optional[GraphDB] = None):
        """
        Initialize ontology service
        
        Args:
            graph_db: Optional existing GraphDB instance
        """
        self.graph_service = GraphService(graph_db)
        self.graph = self.graph_service.graph
        self._initialize_ontology()
    
    def _get_node_data(self, node_id: str) -> Dict[str, Any]:
        """Helper method to get node data from GraphDB"""
        node_result = self.graph.get_node(node_id)
        if node_result and isinstance(node_result, dict) and 'data' in node_result:
            return node_result['data']
        return node_result or {}
    
    def _initialize_ontology(self):
        """Initialize root ontology concepts"""
        # Create root class (Thing) if it doesn't exist
        if not self.graph.node_exists("owl:Thing"):
            self.graph.add_node(
                "owl:Thing",
                data={
                    "label": "Thing",
                    "node_type": self.CLASS_TYPE,
                    "description": "Root of all classes"
                }
            )
    
    # ========================================================================
    # Class Operations
    # ========================================================================
    
    def create_class(self, class_obj: OntologyClass) -> OntologyClass:
        """
        Create a new ontology class
        
        Args:
            class_obj: OntologyClass definition
            
        Returns:
            Created OntologyClass
            
        Raises:
            ValidationError: If class already exists or validation fails
        """
        if self.graph.node_exists(class_obj.id):
            raise ValidationError(f"Class '{class_obj.id}' already exists")
        
        # Validate parent classes exist
        for parent_id in class_obj.parent_classes:
            if not self.graph.node_exists(parent_id):
                raise NodeNotFoundError(f"Parent class '{parent_id}' not found")
        
        # Create class node
        node_data = {
            "label": class_obj.label,
            "node_type": self.CLASS_TYPE,
            "description": class_obj.description or "",
            "is_abstract": class_obj.is_abstract,
        }
        node_data.update(class_obj.properties)
        self.graph.add_node(class_obj.id, data=node_data)
        
        # Add parent relationships (if no parents, default to owl:Thing)
        if not class_obj.parent_classes:
            class_obj.parent_classes = ["owl:Thing"]
        
        for parent_id in class_obj.parent_classes:
            self.graph.add_edge(
                class_obj.id,
                parent_id,
                label=self.SUBCLASS_RELATION,
                weight=1.0
            )
        
        # Add equivalent class relationships
        for equiv_id in class_obj.equivalent_classes:
            if self.graph.node_exists(equiv_id):
                self.graph.add_edge(class_obj.id, equiv_id, label="owl:equivalentClass")
        
        # Add disjoint class relationships
        for disj_id in class_obj.disjoint_classes:
            if self.graph.node_exists(disj_id):
                self.graph.add_edge(class_obj.id, disj_id, label="owl:disjointWith")
        
        return class_obj
    
    def get_class(self, class_id: str) -> OntologyClass:
        """Get class by ID"""
        if not self.graph.node_exists(class_id):
            raise NodeNotFoundError(f"Class '{class_id}' not found")
        
        node_data = self._get_node_data(class_id)
        
        if node_data.get('node_type') != self.CLASS_TYPE:
            raise ValidationError(f"Node '{class_id}' is not a class")
        
        # Get parent classes
        parent_classes = []
        edges = self.graph.get_all_edges()
        for from_node, to_node, weight in edges:
            edge_data = self.graph.get_edge(from_node, to_node)
            if from_node == class_id and edge_data and edge_data.get('label') == self.SUBCLASS_RELATION:
                parent_classes.append(to_node)
        
        return OntologyClass(
            id=class_id,
            label=node_data.get('label', class_id),
            description=node_data.get('description'),
            parent_classes=parent_classes,
            is_abstract=node_data.get('is_abstract', False)
        )
    
    def get_all_classes(self) -> List[OntologyClass]:
        """Get all ontology classes"""
        classes = []
        for node_id in self.graph.get_all_nodes():
            node_data = self._get_node_data(node_id)
            if node_data and node_data.get('node_type') == self.CLASS_TYPE:
                try:
                    classes.append(self.get_class(node_id))
                except Exception:
                    continue
        return classes
    
    def delete_class(self, class_id: str, force: bool = False):
        """
        Delete a class
        
        Args:
            class_id: Class ID to delete
            force: If True, also delete all instances and subclasses
        """
        if not force:
            # Check for instances
            instances = self.get_instances_of_class(class_id)
            if instances:
                raise InvalidOperationError(
                    f"Cannot delete class '{class_id}': has {len(instances)} instances"
                )
            
            # Check for subclasses
            subclasses = self.get_subclasses(class_id, direct_only=True)
            if subclasses:
                raise InvalidOperationError(
                    f"Cannot delete class '{class_id}': has {len(subclasses)} subclasses"
                )
        
        self.graph_service.delete_node(class_id)
    
    def get_class_hierarchy(self, root_id: Optional[str] = None) -> ClassHierarchy:
        """
        Get class hierarchy tree
        
        Args:
            root_id: Root class ID (defaults to owl:Thing)
            
        Returns:
            ClassHierarchy tree structure
        """
        if root_id is None:
            root_id = "owl:Thing"
        
        def build_hierarchy(class_id: str, depth: int = 0) -> ClassHierarchy:
            class_obj = self.get_class(class_id)
            subclasses = self.get_subclasses(class_id, direct_only=True)
            instance_count = len(self.get_instances_of_class(class_id, direct_only=True))
            
            node = ClassHierarchy(
                class_id=class_id,
                label=class_obj.label,
                instance_count=instance_count,
                depth=depth
            )
            
            for subclass in subclasses:
                child = build_hierarchy(subclass.id, depth + 1)
                child.parent_id = class_id
                node.children.append(child)
            
            return node
        
        return build_hierarchy(root_id)
    
    def get_subclasses(self, class_id: str, direct_only: bool = False) -> List[OntologyClass]:
        """
        Get subclasses of a class
        
        Args:
            class_id: Parent class ID
            direct_only: If True, only direct subclasses
            
        Returns:
            List of subclasses
        """
        subclasses = []
        edges = self.graph.get_all_edges()
        
        for from_node, to_node, weight in edges:
            if to_node == class_id:
                edge_data = self.graph.get_edge(from_node, to_node)
                if edge_data and edge_data.get('label') == self.SUBCLASS_RELATION:
                    try:
                        subclasses.append(self.get_class(from_node))
                        
                        # Recursively get indirect subclasses
                        if not direct_only:
                            indirect = self.get_subclasses(from_node, direct_only=False)
                            subclasses.extend(indirect)
                    except Exception:
                        continue
        
        return subclasses
    
    def get_superclasses(self, class_id: str, direct_only: bool = False) -> List[OntologyClass]:
        """Get superclasses (ancestors) of a class"""
        superclasses = []
        edges = self.graph.get_all_edges()
        
        for from_node, to_node, weight in edges:
            if from_node == class_id:
                edge_data = self.graph.get_edge(from_node, to_node)
                if edge_data and edge_data.get('label') == self.SUBCLASS_RELATION:
                    try:
                        superclasses.append(self.get_class(to_node))
                        
                        if not direct_only:
                            indirect = self.get_superclasses(to_node, direct_only=False)
                            superclasses.extend(indirect)
                    except Exception:
                        continue
        
        return superclasses
    
    # ========================================================================
    # Property Operations
    # ========================================================================
    
    def create_property(self, prop_obj: OntologyProperty) -> OntologyProperty:
        """Create a new ontology property"""
        if self.graph.node_exists(prop_obj.id):
            raise ValidationError(f"Property '{prop_obj.id}' already exists")
        
        # Create property node
        self.graph.add_node(
            prop_obj.id,
            data={
                "label": prop_obj.label,
                "node_type": self.PROPERTY_TYPE,
                "property_type": prop_obj.property_type.value,
                "description": prop_obj.description or "",
                "inverse_of": prop_obj.inverse_of or "",
                "characteristics": ",".join(c.value for c in prop_obj.characteristics)
            }
        )
        
        # Add domain relationships
        for domain_class in prop_obj.domain:
            if self.graph.node_exists(domain_class):
                self.graph.add_edge(prop_obj.id, domain_class, label=self.DOMAIN_RELATION)
        
        # Add range relationships
        for range_class in prop_obj.range:
            # Range can be class or datatype
            if self.graph.node_exists(range_class):
                self.graph.add_edge(prop_obj.id, range_class, label=self.RANGE_RELATION)
        
        return prop_obj
    
    def get_property(self, property_id: str) -> OntologyProperty:
        """Get property by ID"""
        if not self.graph.node_exists(property_id):
            raise NodeNotFoundError(f"Property '{property_id}' not found")
        
        node_data = self._get_node_data(property_id)
        
        if node_data.get('node_type') != self.PROPERTY_TYPE:
            raise ValidationError(f"Node '{property_id}' is not a property")
        
        # Get domain and range
        domain = []
        range_list = []
        edges = self.graph.get_all_edges()
        
        for from_node, to_node, weight in edges:
            if from_node == property_id:
                edge_data = self.graph.get_edge(from_node, to_node)
                if edge_data:
                    label = edge_data.get('label')
                    if label == self.DOMAIN_RELATION:
                        domain.append(to_node)
                    elif label == self.RANGE_RELATION:
                        range_list.append(to_node)
        
        # Get characteristics
        char_str = node_data.get('characteristics', '')
        characteristics = set()
        if char_str:
            for c in char_str.split(','):
                try:
                    characteristics.add(PropertyCharacteristic(c))
                except ValueError:
                    pass
        
        return OntologyProperty(
            id=property_id,
            label=node_data.get('label', property_id),
            property_type=PropertyType(node_data.get('property_type', 'object')),
            description=node_data.get('description'),
            domain=domain,
            range=range_list,
            inverse_of=node_data.get('inverse_of') or None,
            characteristics=characteristics
        )
    
    def get_all_properties(self) -> List[OntologyProperty]:
        """Get all ontology properties"""
        properties = []
        for node_id in self.graph.get_all_nodes():
            node_data = self._get_node_data(node_id)
            if node_data and node_data.get('node_type') == self.PROPERTY_TYPE:
                try:
                    properties.append(self.get_property(node_id))
                except Exception as e:
                    # Log exceptions for debugging
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Error getting property {node_id}: {e}")
                    continue
        return properties
    
    # ========================================================================
    # Instance Operations
    # ========================================================================
    
    def create_instance(self, instance_obj: OntologyInstance) -> OntologyInstance:
        """Create a new instance"""
        if self.graph.node_exists(instance_obj.id):
            raise ValidationError(f"Instance '{instance_obj.id}' already exists")
        
        # Validate classes exist
        for class_id in instance_obj.class_ids:
            if not self.graph.node_exists(class_id):
                raise NodeNotFoundError(f"Class '{class_id}' not found")
        node_data = {
            "label": instance_obj.label,
            "node_type": self.INSTANCE_TYPE,
        }
        node_data.update(instance_obj.properties)
        self.graph.add_node(instance_obj.id, data=node_data)
        
        # Add type relationships
        for class_id in instance_obj.class_ids:
            self.graph.add_edge(instance_obj.id, class_id, label=self.TYPE_RELATION)
        
        return instance_obj
    
    def get_instance(self, instance_id: str) -> OntologyInstance:
        """Get instance by ID"""
        if not self.graph.node_exists(instance_id):
            raise NodeNotFoundError(f"Instance '{instance_id}' not found")
        
        node_data = self._get_node_data(instance_id)
        
        if node_data.get('node_type') != self.INSTANCE_TYPE:
            raise ValidationError(f"Node '{instance_id}' is not an instance")
        
        # Get classes
        class_ids = []
        edges = self.graph.get_all_edges()
        for from_node, to_node, weight in edges:
            if from_node == instance_id:
                edge_data = self.graph.get_edge(from_node, to_node)
                if edge_data and edge_data.get('label') == self.TYPE_RELATION:
                    class_ids.append(to_node)
        
        return OntologyInstance(
            id=instance_id,
            label=node_data.get('label', instance_id),
            class_ids=class_ids,
            properties=node_data
        )
    
    def get_instances_of_class(self, class_id: str, direct_only: bool = True) -> List[OntologyInstance]:
        """Get all instances of a class"""
        instances = []
        edges = self.graph.get_all_edges()
        
        target_classes = {class_id}
        if not direct_only:
            # Include subclasses
            subclasses = self.get_subclasses(class_id, direct_only=False)
            target_classes.update(sc.id for sc in subclasses)
        
        for from_node, to_node, weight in edges:
            if to_node in target_classes:
                edge_data = self.graph.get_edge(from_node, to_node)
                if edge_data and edge_data.get('label') == self.TYPE_RELATION:
                    try:
                        instances.append(self.get_instance(from_node))
                    except Exception:
                        continue
        
        return instances
    
    # ========================================================================
    # Reasoning Operations
    # ========================================================================
    
    def check_consistency(self) -> ReasoningResult:
        """
        Check ontology consistency
        
        Basic checks:
        - No cycles in class hierarchy
        - Domain/range constraints satisfied
        - Disjoint class violations
        """
        import time
        start_time = time.time()
        
        result = ReasoningResult(consistent=True)
        
        # Check for cycles in class hierarchy
        def has_cycle(class_id: str, visited: Set[str]) -> bool:
            if class_id in visited:
                return True
            visited.add(class_id)
            
            superclasses = self.get_superclasses(class_id, direct_only=True)
            for parent in superclasses:
                if has_cycle(parent.id, visited.copy()):
                    return True
            return False
        
        for class_obj in self.get_all_classes():
            if has_cycle(class_obj.id, set()):
                result.consistent = False
                result.errors.append(f"Circular inheritance detected involving '{class_obj.id}'")
        
        result.reasoning_time = time.time() - start_time
        return result
    
    # ========================================================================
    # Property Inheritance & Reasoning
    # ========================================================================
    
    def get_class_properties(self, class_id: str) -> List[Dict[str, Any]]:
        """
        Get properties defined on a specific class (domain relationship)
        
        Args:
            class_id: Class ID
            
        Returns:
            List of property definitions with metadata
        """
        properties = []
        all_props = self.get_all_properties()
        
        for prop in all_props:
            if class_id in prop.domain:
                properties.append({
                    'id': prop.id,
                    'label': prop.label,
                    'property_type': prop.property_type.value,
                    'description': prop.description,
                    'range': prop.range,
                    'required': False,  # Default - can be enhanced later
                    'source': 'direct'
                })
        
        return properties
    
    def compute_inherited_properties(
        self, 
        class_id: str, 
        visited: Optional[Set[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Recursively compute all inherited properties from parent classes
        
        Args:
            class_id: Class ID to compute inheritance for
            visited: Set of already visited class IDs (prevents circular inheritance)
            
        Returns:
            List of inherited property definitions with source tracking
        """
        if visited is None:
            visited = set()
        
        # Prevent circular inheritance
        if class_id in visited:
            return []
        
        visited.add(class_id)
        
        try:
            class_obj = self.get_class(class_id)
        except NodeNotFoundError:
            return []
        
        inherited = []
        
        # Process each parent class
        for parent_id in class_obj.parent_classes:
            # Skip owl:Thing as it has no meaningful properties
            if parent_id == "owl:Thing":
                continue
            
            try:
                parent_class = self.get_class(parent_id)
                
                # Get parent's direct properties
                parent_props = self.get_class_properties(parent_id)
                for prop in parent_props:
                    prop_copy = prop.copy()
                    prop_copy['source'] = parent_class.label
                    prop_copy['inheritance_path'] = [parent_class.label]
                    inherited.append(prop_copy)
                
                # Recursively get grandparent properties
                grandparent_props = self.compute_inherited_properties(parent_id, visited)
                for prop in grandparent_props:
                    prop_copy = prop.copy()
                    # Update inheritance path
                    prop_copy['inheritance_path'] = [parent_class.label] + prop_copy.get('inheritance_path', [])
                    inherited.append(prop_copy)
                    
            except NodeNotFoundError:
                continue
        
        return inherited
    
    def get_class_full(self, class_id: str) -> Dict[str, Any]:
        """
        Get complete class information including inherited properties
        
        Args:
            class_id: Class ID
            
        Returns:
            Dictionary with full class details including direct and inherited properties
        """
        class_obj = self.get_class(class_id)
        
        # Get direct properties
        direct_properties = self.get_class_properties(class_id)
        
        # Get inherited properties
        inherited_properties = self.compute_inherited_properties(class_id)
        
        # Combine all properties
        all_properties = direct_properties + inherited_properties
        
        return {
            'id': class_obj.id,
            'label': class_obj.label,
            'description': class_obj.description,
            'parent_classes': class_obj.parent_classes,
            'is_abstract': class_obj.is_abstract,
            'direct_properties': direct_properties,
            'inherited_properties': inherited_properties,
            'all_properties': all_properties
        }
    
    def validate_instance_properties(
        self, 
        class_id: str, 
        properties: Dict[str, Any]
    ) -> List[str]:
        """
        Validate instance properties against class requirements (including inherited)
        
        Args:
            class_id: Class ID that instance belongs to
            properties: Property values to validate
            
        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []
        
        # Get all properties (direct + inherited)
        class_full = self.get_class_full(class_id)
        all_props = class_full['all_properties']
        
        # Check required properties
        for prop in all_props:
            if prop.get('required', False):
                prop_name = prop['id']
                if prop_name not in properties or properties[prop_name] is None:
                    source_info = f" (inherited from {prop['source']})" if prop['source'] != 'direct' else ""
                    errors.append(
                        f"Missing required property '{prop['label']}'{source_info}"
                    )
        
        # Type validation can be added here in future
        # For now, we just check required fields
        
        return errors
    
    def get_statistics(self) -> OntologyStats:
        """Get ontology statistics"""
        all_classes = self.get_all_classes()
        all_properties = self.get_all_properties()
        
        # Count instances
        total_instances = 0
        for node_id in self.graph.get_all_nodes():
            node_data = self._get_node_data(node_id)
            if node_data and node_data.get('node_type') == self.INSTANCE_TYPE:
                total_instances += 1
        
        # Count by property type
        obj_props = sum(1 for p in all_properties if p.property_type == PropertyType.OBJECT)
        data_props = sum(1 for p in all_properties if p.property_type == PropertyType.DATA)
        annot_props = sum(1 for p in all_properties if p.property_type == PropertyType.ANNOTATION)
        
        # Calculate max hierarchy depth
        def get_depth(class_id: str) -> int:
            superclasses = self.get_superclasses(class_id, direct_only=True)
            if not superclasses:
                return 0
            return 1 + max(get_depth(sc.id) for sc in superclasses)
        
        max_depth = 0
        for class_obj in all_classes:
            depth = get_depth(class_obj.id)
            max_depth = max(max_depth, depth)
        
        return OntologyStats(
            total_classes=len(all_classes),
            total_properties=len(all_properties),
            total_instances=total_instances,
            total_object_properties=obj_props,
            total_data_properties=data_props,
            total_annotation_properties=annot_props,
            max_hierarchy_depth=max_depth
        )
    
    def validate_ontology(self) -> ValidationResult:
        """Validate entire ontology structure"""
        result = ValidationResult(valid=True)
        
        # Check consistency
        consistency = self.check_consistency()
        if not consistency.consistent:
            for error in consistency.errors:
                result.add_error(error, error_type="consistency")
        
        # Check for orphan classes (no parent except owl:Thing)
        for class_obj in self.get_all_classes():
            if class_obj.id != "owl:Thing":
                if not class_obj.parent_classes:
                    result.add_warning(
                        f"Class '{class_obj.id}' has no parent classes",
                        class_obj.id,
                        "hierarchy"
                    )
        
        return result

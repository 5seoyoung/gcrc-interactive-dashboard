"""
GCRC 3D Climate Visualization Script
Blender Python script for generating 3D climate risk visualizations
Based on the original climate visualization requirements
"""

import bpy
import bmesh
import json
import math
import random
import os
from datetime import datetime, timedelta

class ClimateVisualizer:
    def __init__(self):
        self.scale_factor = 0.000000003
        self.start_frame = 1
        self.end_frame = 100
        self.rotation_frame_end = 200
        self.data_file_path = None
        self.climate_data = {}
        
    def clear_scene(self):
        """Clear all existing objects from the scene"""
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Clear materials
        for material in bpy.data.materials:
            bpy.data.materials.remove(material)
            
        print("Scene cleared successfully")
    
    def load_climate_data(self, file_path=None):
        """Load climate data from JSON file or use mock data"""
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.climate_data = json.load(f)
                print(f"Climate data loaded from {file_path}")
            except Exception as e:
                print(f"Error loading data file: {e}")
                self.generate_mock_data()
        else:
            print("No data file provided, generating mock data")
            self.generate_mock_data()
    
    def generate_mock_data(self):
        """Generate mock climate data for demonstration"""
        regions = [
            {"name": "Pacific_Coast", "risk_score": 85, "lat": 37.7749, "lng": -122.4194, "type": "sea_level_rise"},
            {"name": "Sahara_South", "risk_score": 92, "lat": 12.0, "lng": 8.0, "type": "extreme_drought"},
            {"name": "Bangladesh", "risk_score": 78, "lat": 23.685, "lng": 90.3563, "type": "flooding"},
            {"name": "Australia_East", "risk_score": 71, "lat": -33.8688, "lng": 151.2093, "type": "wildfire"},
            {"name": "Arctic_Region", "risk_score": 89, "lat": 71.0, "lng": -8.0, "type": "ice_melt"},
            {"name": "Amazon_Basin", "risk_score": 76, "lat": -3.4653, "lng": -62.2159, "type": "deforestation"},
            {"name": "Himalayan_Region", "risk_score": 83, "lat": 28.0, "lng": 84.0, "type": "glacier_retreat"},
            {"name": "Caribbean", "risk_score": 74, "lat": 21.0, "lng": -78.0, "type": "hurricane"}
        ]
        
        self.climate_data = {
            "regions": regions,
            "metadata": {
                "generated": datetime.now().isoformat(),
                "total_regions": len(regions),
                "avg_risk": sum(r["risk_score"] for r in regions) / len(regions)
            }
        }
        
        print(f"Generated mock data for {len(regions)} regions")
    
    def create_base_sphere(self):
        """Create base Earth sphere"""
        bpy.ops.mesh.uv_sphere_add(radius=10, location=(0, 0, 0))
        earth = bpy.context.active_object
        earth.name = "Earth_Base"
        
        # Create Earth material
        earth_material = bpy.data.materials.new(name="Earth_Material")
        earth_material.use_nodes = True
        earth_material.node_tree.nodes.clear()
        
        # Add nodes
        output_node = earth_material.node_tree.nodes.new(type='ShaderNodeOutputMaterial')
        principled_node = earth_material.node_tree.nodes.new(type='ShaderNodeBsdfPrincipled')
        
        # Set earth color (blue-green)
        principled_node.inputs['Base Color'].default_value = (0.1, 0.3, 0.8, 1.0)
        principled_node.inputs['Roughness'].default_value = 0.8
        
        # Connect nodes
        earth_material.node_tree.links.new(
            principled_node.outputs['BSDF'], 
            output_node.inputs['Surface']
        )
        
        earth.data.materials.append(earth_material)
        print("Base Earth sphere created")
        
        return earth
    
    def lat_lng_to_xyz(self, lat, lng, radius=10):
        """Convert latitude/longitude to 3D coordinates on sphere"""
        lat_rad = math.radians(lat)
        lng_rad = math.radians(lng)
        
        x = radius * math.cos(lat_rad) * math.cos(lng_rad)
        y = radius * math.cos(lat_rad) * math.sin(lng_rad)
        z = radius * math.sin(lat_rad)
        
        return (x, y, z)
    
    def create_risk_indicators(self):
        """Create 3D indicators for climate risk regions"""
        if not self.climate_data.get("regions"):
            print("No climate data available")
            return
            
        for region in self.climate_data["regions"]:
            # Calculate position on sphere
            x, y, z = self.lat_lng_to_xyz(region["lat"], region["lng"])
            
            # Create indicator (cube that will be scaled)
            bpy.ops.mesh.cube_add(location=(x, y, z))
            indicator = bpy.context.active_object
            indicator.name = region["name"]
            
            # Scale based on risk score
            base_scale = 0.5
            risk_scale = base_scale + (region["risk_score"] / 100) * 2
            indicator.scale = (risk_scale, risk_scale, risk_scale)
            
            # Create material based on risk level
            material = self.create_risk_material(region["risk_score"], region["type"])
            indicator.data.materials.append(material)
            
            # Add height animation
            self.add_height_animation(indicator, region["risk_score"])
            
            print(f"Created indicator for {region['name']} (Risk: {region['risk_score']})")
    
    def create_risk_material(self, risk_score, risk_type):
        """Create material based on risk score and type"""
        material_name = f"Risk_{risk_score}_{risk_type}"
        material = bpy.data.materials.new(name=material_name)
        material.use_nodes = True
        material.node_tree.nodes.clear()
        
        # Add nodes
        output_node = material.node_tree.nodes.new(type='ShaderNodeOutputMaterial')
        principled_node = material.node_tree.nodes.new(type='ShaderNodeBsdfPrincipled')
        emission_node = material.node_tree.nodes.new(type='ShaderNodeEmission')
        mix_node = material.node_tree.nodes.new(type='ShaderNodeMixShader')
        
        # Color based on risk score
        if risk_score >= 80:
            color = (1.0, 0.1, 0.1, 1.0)  # Red for critical
        elif risk_score >= 60:
            color = (1.0, 0.5, 0.0, 1.0)  # Orange for high
        elif risk_score >= 40:
            color = (1.0, 1.0, 0.0, 1.0)  # Yellow for medium
        else:
            color = (0.0, 1.0, 0.0, 1.0)  # Green for low
        
        # Set material properties
        principled_node.inputs['Base Color'].default_value = color
        principled_node.inputs['Metallic'].default_value = 0.3
        principled_node.inputs['Roughness'].default_value = 0.2
        
        # Add emission for glow effect
        emission_node.inputs['Color'].default_value = color
        emission_node.inputs['Strength'].default_value = risk_score / 100 * 2
        
        # Mix shader and emission
        mix_node.inputs['Fac'].default_value = 0.3
        
        # Connect nodes
        material.node_tree.links.new(principled_node.outputs['BSDF'], mix_node.inputs[1])
        material.node_tree.links.new(emission_node.outputs['Emission'], mix_node.inputs[2])
        material.node_tree.links.new(mix_node.outputs['Shader'], output_node.inputs['Surface'])
        
        return material
    
    def add_height_animation(self, obj, risk_score):
        """Add height animation based on risk score"""
        # Calculate target scale based on risk score
        target_z_scale = 1 + risk_score * self.scale_factor * 1000000  # Amplify for visibility
        
        # Set initial keyframe
        obj.scale.z = 1
        obj.keyframe_insert(data_path="scale", index=2, frame=self.start_frame)
        
        # Set final keyframe
        obj.scale.z = target_z_scale
        obj.keyframe_insert(data_path="scale", index=2, frame=self.end_frame)
        
        # Set interpolation to ease in/out
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'BEZIER'
                    keyframe.handle_left_type = 'AUTO'
                    keyframe.handle_right_type = 'AUTO'
    
    def setup_camera_animation(self):
        """Setup camera with orbital animation"""
        # Create camera
        bpy.ops.object.camera_add(location=(0, -30, 15))
        camera = bpy.context.active_object
        camera.name = "Main_Camera"
        camera.rotation_euler.x = math.radians(60)
        
        # Create camera target (empty object)
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
        camera_target = bpy.context.active_object
        camera_target.name = "Camera_Target"
        
        # Parent camera to target
        camera.parent = camera_target
        
        # Add rotation animation to target
        camera_target.rotation_euler.z = 0
        camera_target.keyframe_insert(data_path="rotation_euler", index=2, frame=self.start_frame)
        
        camera_target.rotation_euler.z = math.radians(360)
        camera_target.keyframe_insert(data_path="rotation_euler", index=2, frame=self.rotation_frame_end)
        
        # Set camera as active
        bpy.context.scene.camera = camera
        
        print("Camera animation setup complete")
        
        return camera
    
    def setup_lighting(self):
        """Setup lighting for the scene"""
        # Remove default light
        bpy.ops.object.select_all(action='DESELECT')
        for obj in bpy.data.objects:
            if obj.type == 'LIGHT':
                obj.select_set(True)
                bpy.ops.object.delete()
        
        # Add sun light
        bpy.ops.object.light_add(type='SUN', location=(20, 20, 20))
        sun = bpy.context.active_object
        sun.name = "Sun_Light"
        sun.data.energy = 3
        sun.data.angle = math.radians(5)
        
        # Add area lights for fill
        bpy.ops.object.light_add(type='AREA', location=(-15, -15, 10))
        fill_light = bpy.context.active_object
        fill_light.name = "Fill_Light"
        fill_light.data.energy = 1
        fill_light.data.size = 10
        
        print("Lighting setup complete")
    
    def setup_render_settings(self):
        """Configure render settings"""
        scene = bpy.context.scene
        
        # Render engine
        scene.render.engine = 'BLENDER_EEVEE'
        
        # Resolution
        scene.render.resolution_x = 1920
        scene.render.resolution_y = 1080
        scene.render.resolution_percentage = 100
        
        # Frame range
        scene.frame_start = self.start_frame
        scene.frame_end = self.rotation_frame_end
        
        # Output settings
        scene.render.image_settings.file_format = 'PNG'
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.film_transparent = True
        
        # Eevee settings
        scene.eevee.use_gtao = True
        scene.eevee.gtao_distance = 0.2
        scene.eevee.use_bloom = True
        scene.eevee.bloom_intensity = 0.8
        scene.eevee.bloom_threshold = 0.8
        
        print("Render settings configured")
    
    def add_data_labels(self):
        """Add text labels for data visualization"""
        for region in self.climate_data.get("regions", []):
            x, y, z = self.lat_lng_to_xyz(region["lat"], region["lng"], radius=12)
            
            # Create text object
            bpy.ops.object.text_add(location=(x, y, z))
            text_obj = bpy.context.active_object
            text_obj.name = f"Label_{region['name']}"
            
            # Set text content
            text_obj.data.body = f"{region['name']}\n{region['risk_score']}"
            text_obj.data.size = 0.5
            text_obj.data.align_x = 'CENTER'
            
            # Create text material
            text_material = bpy.data.materials.new(name=f"Text_{region['name']}")
            text_material.use_nodes = True
            principled = text_material.node_tree.nodes.get('Principled BSDF')
            if principled:
                principled.inputs['Base Color'].default_value = (1, 1, 1, 1)
                principled.inputs['Emission'].default_value = (1, 1, 1, 1)
                principled.inputs['Emission Strength'].default_value = 2
            
            text_obj.data.materials.append(text_material)
            
            # Rotate to face camera
            text_obj.rotation_euler = (math.radians(90), 0, 0)
    
    def export_data_summary(self, output_path="./climate_data_summary.json"):
        """Export a summary of the visualization data"""
        summary = {
            "visualization_info": {
                "created": datetime.now().isoformat(),
                "total_regions": len(self.climate_data.get("regions", [])),
                "frame_range": [self.start_frame, self.rotation_frame_end],
                "scale_factor": self.scale_factor
            },
            "regions": self.climate_data.get("regions", []),
            "risk_statistics": {
                "max_risk": max((r["risk_score"] for r in self.climate_data.get("regions", [])), default=0),
                "min_risk": min((r["risk_score"] for r in self.climate_data.get("regions", [])), default=0),
                "avg_risk": sum(r["risk_score"] for r in self.climate_data.get("regions", [])) / len(self.climate_data.get("regions", [])) if self.climate_data.get("regions") else 0
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Data summary exported to {output_path}")
    
    def render_animation(self, output_path="./renders/"):
        """Render the complete animation"""
        if not os.path.exists(output_path):
            os.makedirs(output_path)
        
        scene = bpy.context.scene
        scene.render.filepath = os.path.join(output_path, "climate_visualization_")
        
        # Render animation
        bpy.ops.render.render(animation=True)
        print(f"Animation rendered to {output_path}")
    
    def create_complete_visualization(self, data_file=None, output_path="./renders/"):
        """Create complete climate visualization"""
        print("Starting GCRC Climate Visualization...")
        
        # Clear scene
        self.clear_scene()
        
        # Load data
        self.load_climate_data(data_file)
        
        # Create base Earth
        earth = self.create_base_sphere()
        
        # Create risk indicators
        self.create_risk_indicators()
        
        # Add data labels
        self.add_data_labels()
        
        # Setup camera animation
        camera = self.setup_camera_animation()
        
        # Setup lighting
        self.setup_lighting()
        
        # Configure render settings
        self.setup_render_settings()
        
        # Export data summary
        self.export_data_summary()
        
        print("Climate visualization setup complete!")
        print(f"Regions visualized: {len(self.climate_data.get('regions', []))}")
        print(f"Animation frames: {self.start_frame} to {self.rotation_frame_end}")
        
        return True

# Main execution
if __name__ == "__main__":
    visualizer = ClimateVisualizer()
    
    # Check for command line arguments
    import sys
    data_file = None
    output_path = "./renders/"
    
    if len(sys.argv) > 1:
        data_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    
    # Create visualization
    success = visualizer.create_complete_visualization(data_file, output_path)
    
    if success:
        print("🌍 GCRC Climate Visualization completed successfully!")
        
        # Optionally render automatically
        render_immediately = False  # Set to True for automatic rendering
        if render_immediately:
            visualizer.render_animation(output_path)
    else:
        print("❌ Visualization setup failed")
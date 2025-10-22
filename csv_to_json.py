#!/usr/bin/env python3
"""
CSV to JSON Converter for StoryMap Data
Converts StoryMapData CSV to JSON format compatible with the app
"""

import csv
import json
import sys
from pathlib import Path

def clean_value(value):
    """Clean and normalize CSV values"""
    if not value:
        return None
    value = str(value).strip()
    return value if value else None

def parse_leads(leads_str):
    """Parse project leads from comma-separated string"""
    if not leads_str:
        return []
    # Split by comma but preserve quotes
    leads = [lead.strip().strip('"') for lead in leads_str.split(',')]
    return [lead for lead in leads if lead]

def parse_coordinates(lat_str, lon_str):
    """Parse and validate coordinates"""
    try:
        if lat_str and lon_str:
            lat = float(lat_str)
            lon = float(lon_str)
            return lat, lon
    except (ValueError, TypeError):
        pass
    return None, None

def parse_year(year_str):
    """Extract year from grant cycle string"""
    if not year_str:
        return None
    try:
        # Try to extract 4-digit year
        year_part = year_str.strip()
        if len(year_part) >= 4:
            year = int(year_part[:4])
            if 2000 <= year <= 2050:
                return year
    except (ValueError, TypeError):
        pass
    return None

def build_project_object(row, index):
    """Convert a CSV row to a project JSON object"""

    project_name = clean_value(row.get('Project Name', ''))
    if not project_name:
        print(f"⚠️  Skipping row {index + 2}: No project name", file=sys.stderr)
        return None

    # Parse coordinates
    lat, lon = parse_coordinates(
        row.get('Latitude', ''),
        row.get('Longitude', '')
    )

    # Create basic project object
    project = {
        'id': f"project-{index}-{project_name.replace(' ', '-').lower()[:30]}",
        'ProjectName': project_name,
        'ProjectLeads': parse_leads(row.get('Project Leads / Contributors', '')),
        'Affiliation': clean_value(row.get('Affiliation / Partner Organization', '')),
        'Year': parse_year(row.get('Year / Grant Cycle', '')),
        'Email': clean_value(row.get('Email', '')),
        'ImageUrl': clean_value(row.get('ImageUrl', '')),
        'ProjectCategory': clean_value(row.get('Project Category/Type', '')),
        'Theme': clean_value(row.get('Subject / Theme', '')),
        'Product': clean_value(row.get('Product', '')),
        'Location': clean_value(row.get('By Project Location (need coordinates)', '')),
        'DescriptionShort': '',  # To be filled later
        'DescriptionLong': '',   # To be filled later
    }

    # Add coordinates if available
    if lat is not None and lon is not None:
        project['Latitude'] = lat
        project['Longitude'] = lon

    # Optional fields for future enhancement
    project['Bio'] = clean_value(row.get('Bio', ''))

    # Initialize empty arrays for media
    project['Artworks'] = []
    project['Music'] = []
    project['Research'] = []
    project['Outcomes'] = []
    project['HasArtwork'] = False
    project['HasMusic'] = False
    project['HasResearch'] = False
    project['HasPoems'] = False

    # Add tags based on category
    project['Tags'] = []
    category = project.get('ProjectCategory', '').lower()
    if 'art' in category:
        project['Tags'].append('art')
        project['HasArtwork'] = True
    if 'research' in category:
        project['Tags'].append('research')
        project['HasResearch'] = True
    if 'music' in project.get('Product', '').lower():
        project['Tags'].append('music')
        project['HasMusic'] = True
    if 'community' in category or 'outreach' in category:
        project['Tags'].append('community')

    return project

def convert_csv_to_json(csv_file, output_file):
    """Main conversion function"""
    print(f"📂 Reading CSV from: {csv_file}")

    projects = []
    errors = []

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for index, row in enumerate(reader):
                # Skip empty rows
                if not any(row.values()):
                    continue

                try:
                    project = build_project_object(row, index)
                    if project:
                        projects.append(project)
                except Exception as e:
                    error_msg = f"Row {index + 2}: {str(e)}"
                    errors.append(error_msg)
                    print(f"❌ {error_msg}", file=sys.stderr)

        if not projects:
            print("❌ No valid projects found in CSV!", file=sys.stderr)
            return False

        # Write JSON output
        print(f"\n✅ Converted {len(projects)} projects")
        print(f"📝 Writing JSON to: {output_file}")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)

        print(f"✨ Conversion complete!")
        print(f"   - Projects: {len(projects)}")
        print(f"   - Errors: {len(errors)}")

        return True

    except FileNotFoundError:
        print(f"❌ CSV file not found: {csv_file}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"❌ Conversion failed: {str(e)}", file=sys.stderr)
        return False

if __name__ == '__main__':
    # Default paths
    script_dir = Path(__file__).parent
    csv_path = script_dir / 'StoryMapData - Sheet1.csv'
    json_path = script_dir / 'storymapdata_v3.json'

    # Allow command line arguments
    if len(sys.argv) > 1:
        csv_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        json_path = Path(sys.argv[2])

    # Run conversion
    success = convert_csv_to_json(str(csv_path), str(json_path))
    sys.exit(0 if success else 1)

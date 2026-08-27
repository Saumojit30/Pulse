"""CRM Exporter for HubSpot and Salesforce formatted GTM data."""

import json
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class CRMExporter:
    """Formats and exports GTM Intelligence data to CRM payload format."""

    @staticmethod
    def format_hubspot_note(target_domain: str, report_text: str) -> Dict[str, Any]:
        """Format report into HubSpot engagement note payload."""
        return {
            "engagement": {
                "active": True,
                "type": "NOTE"
            },
            "associations": {},
            "metadata": {
                "body": f"<h1>GTM Intelligence Scan: {target_domain}</h1><pre>{report_text}</pre>"
            }
        }

    @staticmethod
    def export_to_json_file(file_path: str, data: Dict[str, Any]) -> bool:
        """Export CRM data safely to file with directory creation and exception handling."""
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Failed to export CRM JSON to {file_path}: {str(e)}")
            return False

export type FieldType = 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'boolean' | 'currency';

export interface FieldOption {
    label: string;
    value: string | number;
}

export interface FieldSchema {
    id: string;             // unique identifier (e.g., 'firstName')
    label: string;          // Display name ('First Name')
    type: FieldType;        // Type of input/display formatting
    required: boolean;      // Is the field mandatory?
    editable: boolean;      // Can the user edit this field after creation?
    visibleInTable: boolean;// Should it appear in summary tables?
    visibleInExport: boolean;// Should it appear in CSV exports?
    order: number;          // Position in forms and tables
    options?: FieldOption[];// Dropdown options if type is 'select'
    defaultValue?: any;     // Default value for new records
    systemOnly?: boolean;   // If true, users cannot delete or rename the underlying ID of this field (e.g. 'id', 'createdAt')
}

export interface ModuleSchema {
    moduleId: string;       // e.g., 'retailers', 'orders', 'products'
    moduleName: string;     // Display name ('Retailers')
    fields: FieldSchema[];  // List of configured fields
    updatedAt?: any;        // Firestore Timestamp
    updatedBy?: string;     // User ID who last changed the schema
}

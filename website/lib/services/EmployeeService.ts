import { db } from "@/lib/firebase";
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    setDoc, 
    Timestamp,
    addDoc,
    deleteDoc
} from "firebase/firestore";
import { Employee } from "../models/Employee";

const EMPLOYEES_COLLECTION = "employees";

export class EmployeeService {
    /**
     * Authenticates an employee by username and password.
     * Returns the employee object if successful, null otherwise.
     */
    static async authenticate(username: string, password: string): Promise<Employee | null> {
        try {
            const q = query(
                collection(db, EMPLOYEES_COLLECTION), 
                where("username", "==", username),
                where("password", "==", password)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const employee = { id: doc.id, ...doc.data() } as Employee;
                
                // Update last login
                await setDoc(doc.ref, { lastLogin: Timestamp.now() }, { merge: true });
                
                return employee;
            }
            
            // If no employees exist at all, check if this is the default user and seed it
            const allEmployeesSnap = await getDocs(collection(db, EMPLOYEES_COLLECTION));
            if (allEmployeesSnap.empty && username === "arjuntanpure" && password === "1829203") {
                const defaultEmployee: Employee = {
                    username: "arjuntanpure",
                    password: "1829203",
                    name: "Arjun Tanpure",
                    role: "admin",
                    createdAt: Timestamp.now()
                };
                const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), defaultEmployee);
                return { id: docRef.id, ...defaultEmployee };
            }

            return null;
        } catch (error) {
            console.error("Error authenticating employee:", error);
            return null;
        }
    }

    /**
     * Lists all employees.
     */
    static async getEmployees(): Promise<Employee[]> {
        const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Employee));
    }

    /**
     * Adds a new employee.
     */
    static async addEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Promise<string> {
        const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
            ...employee,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    }

    /**
     * Deletes an employee.
     */
    static async deleteEmployee(id: string): Promise<void> {
        await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
    }
}

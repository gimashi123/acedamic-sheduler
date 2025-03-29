// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useTimetable } from "@/context/timetable/timetable-context";
// import { updateTimetable, getTimetableById } from "@/services/timetable.service";
//
// export const UpdateTimetablePage = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { getTimetables } = useTimetable();
//     const [formData, setFormData] = useState({
//         title: "",
//         description: "",
//         group: "",
//         isPublished: false,
//     });
//
//     useEffect(() => {
//         if (id) {
//             getTimetableById(id).then((data) => {
//                 setFormData(data);
//                 title: data.title || "",
//                 description: data.description || "",
//                 group: data.group || "",
//                 isPublished: data.isPublished || false,
//
//
//             }).catch((error) => {
//                 console.error("Error fetching timetable details:", error);
//             });
//         }
//     }, [id]);
//
//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData({
//             ...formData,
//             [name]: type === "checkbox" ? checked : value,
//         });
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await updateTimetable(id, formData);
//             alert("Timetable updated successfully!");
//             getTimetables(); // Refresh list
//             navigate("/admin/dashboard/timetable");
//         } catch (error) {
//             console.error("Error updating timetable:", error);
//             alert("Failed to update timetable.");
//         }
//     };
//
//     return (
//         <div className="flex justify-center mt-10">
//             <Card className="w-[400px]">
//                 <CardHeader>
//                     <CardTitle>Update Timetable</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//                         <div>
//                             <Label>Title</Label>
//                             <Input name="title" value={formData.title} onChange={handleChange} required />
//                         </div>
//                         <div>
//                             <Label>Description</Label>
//                             <Input name="description" value={formData.description} onChange={handleChange} required />
//                         </div>
//                         <div>
//                             <Label>Group</Label>
//                             <Input name="group" value={formData.group} onChange={handleChange} required />
//                         </div>
//                         <div>
//                             <Label>
//                                 <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} /> Published
//                             </Label>
//                         </div>
//                         <Button type="submit" className="w-full">Update</Button>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

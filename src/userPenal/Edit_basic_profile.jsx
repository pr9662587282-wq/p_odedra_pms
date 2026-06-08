import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Edit_basic_profile({ open, onOpenChange, profile, onUpdated }) {
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Sync form when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Save all fields + photo together in one request
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Priority: URL param id → formData.userId → localStorage userId
      const targetId =
        id ||
        (formData.userId?._id || formData.userId) ||
        localStorage.getItem("userId");

      if (!targetId) {
        alert("Cannot determine user ID. Please refresh and try again.");
        return;
      }

      const url = `http://localhost:5000/profile/${targetId}`;

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && key !== "profileImage") {
          data.append(key, String(val));
        }
      });
      if (imageFile) {
        data.append("profileImage", imageFile);
      }

      const res = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        if (onUpdated) onUpdated(res.data.profile);
        onOpenChange(false);
        alert("Profile updated successfully");
      }
    } catch (err) {
      console.log(err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1";

  // Resolve avatar preview
  const currentImage = imagePreview
    ? imagePreview
    : formData.profileImage
    ? formData.profileImage.startsWith("data:") || formData.profileImage.startsWith("http")
      ? formData.profileImage
      : `data:image/png;base64,${formData.profileImage}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Side panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update your information</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Profile Photo ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Profile Photo
            </p>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="shrink-0">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="avatar"
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
                    {formData.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              {/* Pick button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 rounded-xl border-2 border-dashed border-indigo-200 text-sm font-semibold text-indigo-500 hover:bg-indigo-50 transition"
                >
                  📷 {imageFile ? imageFile.name : "Choose Photo"}
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-1 text-xs text-rose-400 hover:text-rose-600"
                  >
                    ✕ Remove
                  </button>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Photo will be saved with other fields on Save
                </p>
              </div>
            </div>
          </div>

          {/* ── Basic Information ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
              Basic Information
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input name="fullName" value={formData.fullName || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Gender</label>
                  <input name="gender" value={formData.gender || ""} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Blood Group</label>
                  <input name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Birthday</label>
                <input type="date" name="birthday" value={formData.birthday || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nationality</label>
                <input name="nationality" value={formData.nationality || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Marital Status</label>
                <input name="maritalStatus" value={formData.maritalStatus || ""} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Contact Info ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">
              Contact Info
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Personal Email</label>
                <input type="email" name="personalEmail" value={formData.personalEmail || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company Email</label>
                <input type="email" name="companyEmail" value={formData.companyEmail || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input name="phone" value={formData.phone || ""} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Alternate Phone</label>
                  <input name="alternatePhone" value={formData.alternatePhone || ""} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <textarea name="address" value={formData.address || ""} onChange={handleChange} rows={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>LinkedIn</label>
                <input name="linkedin" value={formData.linkedin || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>GitHub</label>
                <input name="github" value={formData.github || ""} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Professional Info ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">
              Professional Info
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Department</label>
                  <input name="department" value={formData.department || ""} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Designation</label>
                  <input name="designation" value={formData.designation || ""} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Batch</label>
                  <input name="batch" value={formData.batch || ""} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Report To</label>
                  <input name="reportTo" value={formData.reportTo || ""} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Joining Date</label>
                <input type="date" name="joiningDate" value={formData.joiningDate || ""} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Emergency Contact ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">
              Emergency Contact
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Contact Person</label>
                <input name="emergencyContactName" value={formData.emergencyContactName || ""} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Phone</label>
                <input name="emergencyContactPhone" value={formData.emergencyContactPhone || ""} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </>
  );
}

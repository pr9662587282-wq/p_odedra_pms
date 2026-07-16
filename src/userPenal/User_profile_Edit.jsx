import { useState, useEffect, useRef } from "react";
import User_Sidebar from "./User_Sidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";
import Edit_basic_profile from "./Edit_basic_profile";
import axios from "axios";
import Sidebar_Admin from "../admin_penal/Sidebar_Admin";
import { useParams, useLocation } from "react-router-dom";
// ─────────────────────────────────────────────────────────────────
// Static data — replace with API later
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// InfoTable — shadcn Table rows
// ─────────────────────────────────────────────────────────────────
function InfoTable({ rows }) {
  return (
    <Table>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow
            key={i}
            className="border-b border-slate-100  transition-colors"
          >
            {/* Label */}
            <TableCell className="w-48 py-3 px-5 text-sm text-slate-400 font-normal align-top">
              {row.label}
            </TableCell>
            {/* Value */}
            <TableCell className="py-3 px-5 text-sm font-semibold  break-words whitespace-normal">
              {row.value ? (
                row.isEmail ? (
                  <a
                    href={`mailto:${row.value}`}
                    className="text-indigo-500 hover:underline"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )
              ) : (
                <span className="text-slate-300 font-normal">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section heading — colored left border accent
// ─────────────────────────────────────────────────────────────────
function SectionHeading({ icon, title, color }) {
  // color options: indigo | violet | emerald | rose | amber
  const bar = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
  };
  const text = {
    indigo: "text-indigo-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
  };
  const bg = {
    indigo: "bg-indigo-50",
    violet: "bg-violet-50",
    emerald: "bg-emerald-50",
    rose: "bg-rose-50",
    amber: "bg-amber-50",
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 mt-2 ${bg[color] || "bg-slate-50"}`}
    >
      <div className={`w-1 h-5 rounded-full ${bar[color] || "bg-slate-400"}`} />
      <span className="text-base">{icon}</span>
      <span
        className={`text-xs font-bold uppercase tracking-widest ${text[color] || "text-slate-600"}`}
      >
        {title}
      </span>
    </div>
  );
}

// Tab list
const TABS = ["About", "Documents", "Skills", "Appreciation"];
const token = () => localStorage.getItem("token");

const config = () => ({
  headers: {
    Authorization: `Bearer ${token()}`,
  },
});
// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function User_profile_Edit() {
  const [activeTab, setActiveTab] = useState("About");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [user, setUser] = useState({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoInputRef = useRef(null);

  const { id } = useParams();
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin;
  const adminViewedFullName = location.state?.adminViewedFullName;

  const role = localStorage.getItem("role");

  const isAdmin = role === "admin";
  const isUser = role === "user";

  const isAdminView = role === "admin" && (fromAdmin === true || id);
  const [fullName, setFullName] = useState(adminViewedFullName || "User");

  useEffect(() => {
    fetchProfile();
  }, [id]);
  ////////////////////////////////////
  /*useEffect(() => {
      if (id) {
        fetchUserProfile(id); // admin user profile
      } else {
        fetchMyProfile(); // self profile
      }
    }, [id]);

    const fetchMyProfile = async () => {
      try {
        setUser({}); // reset old data

        const res = await axios.get("http://localhost:5000/profile/my", config());

        setUser(res.data.profile || {});
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUserProfile = async (userId) => {
      try {
        setUser({}); // reset old data (IMPORTANT)

        const res = await axios.get(
          `http://localhost:5000/profile/${userId}`,
          config(),
        );

        console.log("PROFILE RESPONSE:", res.data);

        setUser(res.data.profile || res.data || {});
      } catch (err) {
        console.log(err);
      }
    };*/
  /////////////////////////////////////////////////////////////////

  const fetchProfile = async () => {
    try {
      let url;
      if (id) {
        // Viewing another user's profile (admin view or permitted user)
        url = `http://localhost:5000/profile/${id}`;
      } else {
        // Viewing own profile — use the dedicated /profile/me endpoint
        url = "http://localhost:5000/profile/me";
      }
      const res = await axios.get(url, config());
      setUser(res.data.profile || {});
    } catch (err) {
      console.log(err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setPhotoLoading(true);
      // If viewing another user's profile use their id, else update the current user's own profile
      const url = id
        ? `http://localhost:5000/profile/${id}`
        : "http://localhost:5000/profile/me";
      const data = new FormData();
      data.append("profileImage", file);
      const res = await axios({
        method: id ? "put" : "post",
        url,
        data,
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      if (res.data.success) {
        setUser(res.data.profile);
      }
    } catch (err) {
      console.log(err);
      alert("Photo upload failed");
    } finally {
      setPhotoLoading(false);
      e.target.value = "";
    }
  };
  /* const fetchProfile = async () => {
    try {
      const url = id
        ? `http://localhost:5000/profile/${id}`
        : "http://localhost:5000/profile/my";

      const res = await axios.get(url, config());

      console.log("PROFILE RESPONSE =>", res.data);

      const profileData =
        res.data.profile || // case 1
        res.data.user || // case 2
        res.data.data || // case 3
        res.data; // fallback

      setUser(profileData || {});
    } catch (err) {
      console.log(err);
    }
  };*/

  /*const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/profile/me", config());

        setUser(res.data.profile || {});
      } catch (error) {
        console.log(error);
      }
    };*/

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* App sidebar */}
      {isUser && <User_Sidebar fullName={fullName} />}
      {isAdmin && <Sidebar_Admin />}
      {/* Main content */}
      <div className="flex-1 dark:bg-slate-950 md:ml-72">
        {/* ── Top header — indigo/violet gradient ── */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 pt-20 md:pt-5">
          <h1 className="text-xl font-bold text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-indigo-200 text-sm mt-0.5">👤 Profile</p>
        </div>

        {/* Page body */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* ── LEFT CARD: Photo + Contact ── */}
            <div className="w-full md:w-52 shrink-0 space-y-4">
              {/* Profile photo card */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden dark:bg-slate-800">
                {/* Avatar area — gradient background */}
                <div className="bg-gradient-to-br from-indigo-100 to-violet-100 h-44 flex items-center justify-center relative">
                  {/* Hidden file input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  {/* Avatar */}
                  <div className="relative">
                    {user.profileImage ? (
                      <img
                        src={
                          user.profileImage.startsWith("data:") ||
                          user.profileImage.startsWith("http")
                            ? user.profileImage
                            : `data:image/png;base64,${user.profileImage}`
                        }
                        alt="profile"
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {user.fullName
                          ?.split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}

                    {/* Camera icon overlay */}
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={photoLoading}
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg transition disabled:opacity-60"
                      title="Change photo"
                    >
                      {photoLoading ? (
                        <svg
                          className="h-4 w-4 text-white animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Name below avatar */}
                <div className="px-3 pt-3 pb-1 text-center">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {user.designation}
                  </p>
                </div>

                {/* Edit button */}
                <div className="px-3 pb-3 pt-2">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-xl transition"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>

              {/* Contact card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 dark:bg-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest dark:text-slate-400">
                  Contact
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-base shrink-0">✉️</span>
                  <span className="text-xs text-indigo-500 break-all leading-relaxed">
                    {user.personalEmail}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">📱</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-white">
                    {user.phone}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">�</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {user.address}
                  </span>
                </div>
              </div>

              {/* Status card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2 dark:bg-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest dark:text-slate-400 mb-2">
                  Status
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Account</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    ✓ Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Batch</span>
                  <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {user.batch}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Blood</span>
                  <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {user.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT CARD: Tabs + Content ── */}
            <div className="flex-1 rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
              {/* Tab bar */}
              <div className="flex border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-xs font-semibold transition border-b-2 ${
                      activeTab === tab
                        ? "border-indigo-500 bg-white text-indigo-600 dark:bg-slate-800"
                        : "border-transparent hover:bg-white  dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── ABOUT ── */}
              {activeTab === "About" && (
                <div className="pb-6">
                  <SectionHeading
                    icon="👤"
                    title="Basic Information"
                    color="indigo"
                  />
                  <InfoTable
                    rows={[
                      {
                        label: "Full Name",
                        value: user.fullName || user.fullname,
                      },
                      {
                        label: "Personal Email",
                        value: user.personalEmail,
                        isEmail: true,
                      },
                      {
                        label: "Company Email",
                        value: user.companyEmail,
                        isEmail: true,
                      },
                      { label: "Gender", value: user.gender },
                      { label: "Birthday", value: user.birthday },
                      { label: "Blood Group", value: user.bloodGroup },
                      { label: "Nationality", value: user.nationality },
                      { label: "Marital Status", value: user.maritalStatus },
                      {
                        label: "Marriage Anniversary",
                        value: user.marriageAnniversary,
                      },
                      {
                        label: "Status",
                        value: (
                          <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ✓ {user.status}
                          </span>
                        ),
                      },
                    ]}
                  />

                  <SectionHeading
                    icon="🏢"
                    title="Company Relation"
                    color="violet"
                  />
                  <InfoTable
                    rows={[
                      { label: "Department", value: user.department },
                      { label: "Designation", value: user.designation },
                      { label: "Batch", value: user.batch },
                      { label: "Report To", value: user.reportTo },
                      { label: "Joining Date", value: user.joiningDate },
                      {
                        label: "Probation End Date",
                        value: user.probationEndDate,
                      },
                      { label: "Work Duration", value: user.workDuration },
                    ]}
                  />

                  <SectionHeading
                    icon="📞"
                    title="Contact Info"
                    color="emerald"
                  />
                  <InfoTable
                    rows={[
                      { label: "Phone", value: user.phone },
                      { label: "Alternate Phone", value: user.alternatePhone },
                      {
                        label: "Personal Email",
                        value: user.personalEmail,
                        isEmail: true,
                      },
                      {
                        label: "Company Email",
                        value: user.companyEmail,
                        isEmail: true,
                      },
                      { label: "LinkedIn", value: user.linkedin },
                      { label: "GitHub", value: user.github },
                      { label: "Address", value: user.address },
                    ]}
                  />

                  <SectionHeading
                    icon="🚨"
                    title="Emergency Contact"
                    color="rose"
                  />
                  <InfoTable
                    rows={[
                      {
                        label: "Contact Person",
                        value: user.emergencyContactName,
                      },
                      { label: "Phone", value: user.emergencyContactPhone },
                    ]}
                  />
                </div>
              )}

              {/* ── DOCUMENTS ── */}
              {activeTab === "Documents" && (
                <div className="pb-6">
                  <SectionHeading
                    icon="🪪"
                    title="Document Numbers"
                    color="indigo"
                  />
                  <InfoTable
                    rows={[
                      { label: "Aadhar Card", value: user.aadhar },
                      { label: "PAN Card", value: user.pan },
                      { label: "Passport", value: user.passport },
                      { label: "Driving License", value: user.drivingLicense },
                    ]}
                  />

                  <SectionHeading
                    icon="📁"
                    title="Upload Documents"
                    color="violet"
                  />
                  <div className="px-5 mt-1 space-y-1">
                    {[
                      "Aadhar Card",
                      "PAN Card",
                      "Passport",
                      "Offer Letter",
                      "Experience Letter",
                      "Degree Certificate",
                    ].map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-base">
                            📎
                          </span>
                          <span className="text-sm text-slate-700 dark:text-white">
                            {doc}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SKILLS ── */}
              {activeTab === "Skills" && (
                <div className="pb-6">
                  <SectionHeading
                    icon="💻"
                    title="Technical Skills"
                    color="indigo"
                  />
                  <div className="flex flex-wrap gap-2 px-5 py-4">
                    {user.skills?.map((s) => (
                      <span
                        key={s}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-sm font-medium px-3 py-1.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <SectionHeading
                    icon="🌐"
                    title="Languages Known"
                    color="emerald"
                  />
                  <div className="flex flex-wrap gap-2 px-5 py-4">
                    {user.languages?.map((l) => (
                      <span
                        key={l}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium px-3 py-1.5 rounded-full"
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  <SectionHeading
                    icon="🏅"
                    title="Certifications"
                    color="amber"
                  />
                  <div className="px-5 py-2 space-y-1">
                    {user.certifications?.map((c) => (
                      <div
                        key={c}
                        className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-base">
                          🎖️
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-white">
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── APPRECIATION ── */}
              {activeTab === "Appreciation" && (
                <div className="text-center py-20 text-slate-400">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-sm font-semibold text-slate-500">
                    No appreciations yet
                  </p>
                  <p className="text-xs mt-1 text-slate-400">
                    Keep up the great work!
                  </p>
                </div>
              )}
            </div>
            {/* end right card */}
          </div>
        </div>

        {/* Edit profile side panel */}
        <Edit_basic_profile
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          profile={user}
          onUpdated={setUser}
        />
      </div>
    </div>
  );
}

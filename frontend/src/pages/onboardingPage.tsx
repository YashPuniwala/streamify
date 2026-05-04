import { FormEvent, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import {
  CameraIcon,
  LoaderIcon,
  ShipWheelIcon,
  ShuffleIcon,
} from "lucide-react";
import { LANGUAGES } from "../constants/index";
import {
  ApiError,
  OnboardingFormState,
  UserData,
} from "../types/frontendTypes";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { City, Country, State } from "country-state-city";

type SelectOption = {
  value: string;
  label: string;
};

const OnboardingPage = () => {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null,
  );
  const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);

  const [formState, setFormState] = useState<OnboardingFormState>({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    nativeLanguage: user?.nativeLanguage || "",
    learningLanguage: user?.learningLanguage || "",
    location: user?.location || "",
    profilePic: user?.profilePic || "",
  });

  const countryOptions: SelectOption[] = Country.getAllCountries().map(
    (country) => ({
      value: country.isoCode,
      label: country.name,
    }),
  );

  const stateOptions: SelectOption[] = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

  const cityOptions: SelectOption[] =
    selectedCountry && selectedState
      ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
          (city) => ({
            value: city.name,
            label: city.name,
          }),
        )
      : [];

  const selectStyles = {
    control: (
      base: Record<string, unknown>,
      state: { isFocused: boolean },
    ) => ({
      ...base,
      minHeight: "3rem",
      borderRadius: "0.5rem",
      borderColor: state.isFocused
        ? "var(--bc)"
        : "color-mix(in oklab, var(--bc) 20%, transparent)",
      boxShadow: "none",
      backgroundColor: "var(--b1)",
      "&:hover": {
        borderColor: "var(--bc)",
      },
    }),
    valueContainer: (base: Record<string, unknown>) => ({
      ...base,
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: "color-mix(in oklab, var(--bc) 60%, transparent)",
    }),
    singleValue: (base: Record<string, unknown>) => ({
      ...base,
      color: "var(--bc)",
    }),

    // 🔴 FIX STARTS HERE
    menuPortal: (base: Record<string, unknown>) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      borderRadius: "0.5rem",
      overflow: "hidden",
      backgroundColor: "#1f2937", // 🔴 FORCE SOLID COLOR (IMPORTANT)
      border: "1px solid rgba(255,255,255,0.1)",
      zIndex: 9999,
    }),
    // 🔴 FIX ENDS HERE

    option: (
      base: Record<string, unknown>,
      state: { isFocused: boolean; isSelected: boolean },
    ) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--p)"
        : state.isFocused
          ? "var(--b2)"
          : "var(--b1)",
      color: state.isSelected ? "var(--pc)" : "var(--bc)",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const { mutate: onboardingMutation, isPending } = useMutation<
    UserData,
    ApiError,
    OnboardingFormState
  >({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });

      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "An error occurred");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) {
      toast.error("Country is required");
      return;
    }

    const locationParts = [
      selectedCity?.label,
      selectedState?.label,
      selectedCountry.label,
    ].filter(Boolean);

    onboardingMutation({
      ...formState,
      location: locationParts.join(", "),
    });
  };

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
<div className="card bg-base-200 w-full max-w-3xl shadow-xl overflow-visible">        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Country *</span>
                </label>
                <Select
                  name="country"
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(option) => {
                    setSelectedCountry(option);
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  placeholder="Select your country"
                  isSearchable
                  styles={selectStyles}
                  // 🔴 ADD THESE 2 LINES
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="bottom"   // 🔴 ADD THIS

                />
              </div>

              {selectedCountry && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">State (Optional)</span>
                  </label>
                  <Select
                    name="state"
                    options={stateOptions}
                    value={selectedState}
                    onChange={(option) => {
                      setSelectedState(option);
                      setSelectedCity(null);
                    }}
                    placeholder="Select your state"
                    isSearchable
                    styles={selectStyles}
                     menuPortalTarget={document.body}
  menuPosition="fixed"
  menuPlacement="bottom"   // 🔴 ADD THIS

                  />
                </div>
              )}

              {selectedCountry && selectedState && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">City (Optional)</span>
                  </label>
                  <Select
                    name="city"
                    options={cityOptions}
                    value={selectedCity}
                    onChange={(option) => setSelectedCity(option)}
                    placeholder="Select your city"
                    isSearchable
                    styles={selectStyles}
                     menuPortalTarget={document.body}
  menuPosition="fixed"
  menuPlacement="bottom"   // 🔴 ADD THIS

                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}

            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;

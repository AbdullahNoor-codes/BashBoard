import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "../components/features/reports/ReportCards";
import { toast } from "sonner";
import { getCurrentLocalDate } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

function Reports() {
  const [reportData, setReportData] = useState(null); // Holds the report data or null
  const [selectedDate, setSelectedDate] = useState(getCurrentLocalDate()); // Default to today's date

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      fetchReport(user.user_id, selectedDate); // Fetch report for the selected date
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  }, [selectedDate]); // Re-fetch report whenever the selected date changes

  const fetchReport = async (userId, date) => {
    console.log("Fetching report...");
    let loadingToastId;
    try {
      console.log("Fetching report for userId:", userId, "and date:", date);

      loadingToastId = toast.loading("Loading Report...");
      const response = await axios.get(
        `https://server-bashboard.vercel.app/apis/tasks/get-report/${userId}/${date}`
      );
      console.log("API Response:", response.data);

      toast.dismiss(loadingToastId);

      // Check if the response contains valid data
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn("No report data available for the selected date.");
        toast.error("No report data available for the selected date.");
        setReportData(null); // Explicitly set reportData to null
        return;
      }

      console.log("Fetched report data:", response.data);

      // Transform the backend data into the format expected by ReportCard
      const formattedData = {
        date: new Date(date).toLocaleDateString("en-GB"), // Format the date for display
        sections: response.data,
      };

      setReportData(formattedData); // Set the fetched data
      toast.success("Report fetched successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry, try again. Could not load the report.");
      console.error("Error fetching report:", error);
      setReportData(null); // Ensure reportData is cleared on error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Reports</h1>
        <div className="w-full max-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  new Date(selectedDate).toLocaleDateString()
                ) : (
                  <span>Select a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : null}
                onSelect={(date) => {
                  if (date) {
                    // Convert the selected date to YYYY-MM-DD format without timezone issues
                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .split("T")[0];
                    setSelectedDate(localDate); // Update the selected date
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {reportData ? (
          <ReportCard data={reportData} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No Report available for the selected date.
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;




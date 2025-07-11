"use client";
import { fetchJobViews, useFetchEmployerJobs } from "@/APIs/auth/jobs";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltips: {
      position: "nearest",
      mode: "index",
      intersect: false,
      yPadding: 10,
      xPadding: 10,
      caretSize: 4,
      backgroundColor: "#1967d2",
      borderColor: "rgba(0,0,0,1)",
      borderWidth: 4,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
        callback: function (value) {
          if (Number.isInteger(value)) {
            return value;
          }
        },
      },
    },
  },
};

function getMonthYear(ts) {
  const date = new Date(ts);
  return `${date.toLocaleString("default", {
    month: "short",
  })} ${date.getFullYear()}`;
}

const ProfileChart = () => {
  const selector = useSelector((store) => store.user);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [labels, setLabels] = useState([]);
  const [viewCounts, setViewCounts] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      // Only fetch data if user ID exists
      if (!selector?.user?.uid) {
        console.warn("ProfileChart: User ID is undefined, skipping data fetch");
        setJobs([]);
        return;
      }

      try {
        const fetchedJobs = await useFetchEmployerJobs(selector.user.uid);
        setJobs(fetchedJobs || []);
      } catch (error) {
        console.error("Error fetching jobs in ProfileChart:", error);
        setJobs([]);
      }
    };
    fetchJobs();
  }, [selector?.user?.uid]);

  useEffect(() => {
    if (!selectedJob) {
      setShowAllJobs(true);
      setLabels([]);
      setViewCounts([]);
      return;
    }
    setShowAllJobs(false);

    (async () => {
      const { labels, viewCounts } = await fetchJobViews(selectedJob);
      setLabels(labels);
      setViewCounts(viewCounts);
    })();
  }, [selectedJob]);

  const handleJobChange = (e) => {
    setSelectedJob(e.target.value);
  };

  const chartData = showAllJobs
    ? {
        labels: jobs.map((j) => j.title),
        datasets: [
          {
            label: "Profile Views",
            data: jobs.map((j) => Math.round(j.viewCount || 0)),
            borderColor: "#1967d2",
            backgroundColor: "#1967d2",
            fill: false,
          },
        ],
      }
    : {
        labels: labels,
        datasets: [
          {
            label: "Profile Views",
            data: viewCounts.map((v) => Math.round(v)),
            borderColor: "#1967d2",
            backgroundColor: "#1967d2",
            fill: false,
          },
        ],
      };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>Your Profile Views</h4>
        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select
            className="chosen-single form-select"
            value={selectedJob}
            onChange={handleJobChange}
          >
            <option value="">All Jobs</option>
            {jobs?.map((job) => (
              <option key={job?.id} value={job?.id}>
                {job?.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* End widget top bar */}

      <div className="widget-content">
        <Line options={options} data={chartData} />
      </div>
      {/* End  profile chart */}
    </div>
  );
};

export default ProfileChart;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, Loader } from 'lucide-react';
import { listTrips, deleteSavedTrip } from '../../lib/api.js';
import { toast } from 'react-toastify';

export default function SavedTripsPanel({ onClose, onLoadTrip }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await listTrips();
        setTrips(Array.isArray(data) ? data : []);
        if (data.length === 0) {
          setError('No saved trips yet. Create one to get started!');
        }
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError('Failed to load your trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    setDeleting(tripId);
    try {
      await deleteSavedTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error('Failed to delete trip');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewTrip = (trip) => {
    try {
      console.log('📌 Loading trip from backend:', trip)
      const itineraryData = typeof trip.itineraryData === 'string'
        ? JSON.parse(trip.itineraryData)
        : trip.itineraryData;

      const tripData = {
        city: trip.city,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelStyles: trip.travelStyles || [],
        pace: trip.pace || 'Balanced',
        homeBase: trip.homeBase || {},
        coordinates: trip.coordinates || null,
      };

      console.log('📌 Constructed tripData with homeBase:', tripData.homeBase)
      onLoadTrip(tripData, itineraryData);
      onClose();
    } catch (err) {
      toast.error('Failed to load trip');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-effect card-elevation rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Trips</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <Loader className="w-8 h-8 text-warm-accent" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/60">{error}</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No saved trips yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const startDate = new Date(trip.createdAt || trip.startDate);
              const formattedDate = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between hover:bg-white/15 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {trip.title || trip.city}
                    </h3>
                    <p className="text-sm text-white/60">
                      {trip.city} • {formattedDate}
                    </p>
                    {trip.startDate && trip.endDate && (
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(trip.startDate).toLocaleDateString()} -{' '}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={() => handleViewTrip(trip)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg text-blue-300 transition-colors"
                      title="View this trip"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deleting === trip.id}
                      whileHover={deleting !== trip.id ? { scale: 1.05 } : {}}
                      whileTap={deleting !== trip.id ? { scale: 0.95 } : {}}
                      className="p-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg text-red-300 transition-colors disabled:opacity-50"
                      title="Delete this trip"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DeviceInfoPage.css';

const DeviceInfoPage = () => {
    const { resourceId } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/resources/${resourceId}`); // Assuming an endpoint like /resources/:id
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();
                setResource(data);
            } catch (err) {
                setError(`Failed to fetch resource details: ${err.message}`);
                console.error('Failed to fetch resource details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (resourceId) {
            fetchResourceDetails();
        }
    }, [resourceId]);

    if (loading) {
        return <div>Loading device information...</div>;
    }

    if (error) {
        return <div>Error: {error} <Link to="/">Go Back</Link></div>;
    }

    if (!resource) {
        return <div>Resource not found. <Link to="/">Go Back</Link></div>;
    }

    // Placeholder data - replace with actual data fetching and state management
    const deviceData = {
        leoGeo: "LEO",
        hardwareType: "Type X Rev 2.1",
        currentEntitlements: "Standard Package, Premium Channels",
        guiLink: resource.ip_address && resource.web_port ? `http://${resource.ip_address}:${resource.web_port}` : null
    };

    const handleStartLog = () => {
        alert(`Starting logs for ${resource.name}... (Not implemented)`);
        // Future implementation: API call to start logging
    };

    const handleViewLive = () => {
        alert(`Opening live view for ${resource.name}... (Not implemented)`);
        // Future implementation: Open a live view interface or stream
    };

    return (
        <div className="device-info-container">
            <div className="device-header">
                <h1>Device Information: {resource.name}</h1>
                <Link to="/" className="back-link">Back to Scheduler</Link>
            </div>

            <div className="info-sections-grid">
                <section className="info-section plots-section">
                    <h2>Plots</h2>
                    <div className="plot-placeholder">Uptime Plot Area (stub)</div>
                    <div className="plot-placeholder">Signal Strength Plot Area (stub)</div>
                    <div className="plot-placeholder">Yaw Angle Plot Area (stub)</div>
                </section>

                <section className="info-section data-section">
                    <h2>Details</h2>
                    <div className="data-item"><strong>IP Address:</strong> {resource.ip_address || 'N/A'}</div>
                    <div className="data-item"><strong>SSH Port:</strong> {resource.ssh_port || 'N/A'}</div>
                    <div className="data-item"><strong>Web Port:</strong> {resource.web_port || 'N/A'}</div>
                    <div className="data-item"><strong>LEO/GEO:</strong> {deviceData.leoGeo} (stub)</div>
                    <div className="data-item"><strong>Hardware Type:</strong> {deviceData.hardwareType} (stub)</div>
                    <div className="data-item"><strong>Current Entitlements:</strong> {deviceData.currentEntitlements} (stub)</div>
                    {deviceData.guiLink ? (
                        <div className="data-item">
                            <strong>GUI Link:</strong> <a href={deviceData.guiLink} target="_blank" rel="noopener noreferrer">{deviceData.guiLink}</a>
                        </div>
                    ) : (
                        <div className="data-item"><strong>GUI Link:</strong> Not available</div>
                    )}
                </section>

                <section className="info-section controls-section">
                    <h2>Controls</h2>
                    <button onClick={handleStartLog} className="control-button">Start Log</button>
                    <button onClick={handleViewLive} className="control-button">View Live Feed</button>
                </section>
            </div>
        </div>
    );
};

export default DeviceInfoPage;

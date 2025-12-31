#!/bin/bash
# process-mtbs-cog.sh
# Downloads Cedar Creek MTBS data, converts to COG, validates
#
# Prerequisites:
#   - GDAL 3.x+ installed (brew install gdal)
#   - rio-cogeo installed (pip install rio-cogeo)
#   - Google Cloud SDK authenticated (gcloud auth application-default login)
#
# Usage:
#   ./scripts/process-mtbs-cog.sh
#
# Output:
#   ~/ranger-geo/mtbs/cedar_creek_severity_cog.tif (ready for upload)

set -euo pipefail

# Configuration
WORK_DIR="${HOME}/ranger-geo/mtbs"
FIRE_ID="or4367412204320220729"  # Cedar Creek Fire 2022
OUTPUT_COG="cedar_creek_severity_cog.tif"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_step() { echo -e "${GREEN}[STEP]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    echo_step "Checking prerequisites..."

    if ! command -v gdalinfo &> /dev/null; then
        echo_error "GDAL not found. Install with: brew install gdal"
        exit 1
    fi

    GDAL_VERSION=$(gdalinfo --version | head -1)
    echo "  GDAL: $GDAL_VERSION"

    if ! command -v rio &> /dev/null; then
        echo_warn "rio-cogeo not found. Installing..."
        pip install rio-cogeo
    fi

    echo_step "Prerequisites OK"
}

# Create working directory
setup_workspace() {
    echo_step "Setting up workspace at ${WORK_DIR}..."
    mkdir -p "${WORK_DIR}"
    cd "${WORK_DIR}"
}

# Download MTBS data
download_mtbs() {
    echo_step "Downloading MTBS data for Cedar Creek Fire..."

    # Check if already downloaded
    if ls ${FIRE_ID}*_dnbr6.tif 1> /dev/null 2>&1; then
        echo_warn "MTBS data already exists, skipping download"
        return 0
    fi

    echo "  Opening MTBS Direct Download in browser..."
    echo "  1. Go to: https://www.mtbs.gov/direct-download"
    echo "  2. Filter: State=Oregon, Year=2022, Fire Name=Cedar Creek"
    echo "  3. Download: Burn Severity Mosaic (GeoTIFF)"
    echo "  4. Extract to: ${WORK_DIR}"
    echo ""
    echo "  Press Enter when download is complete..."
    read -r

    # Verify download
    if ! ls ${FIRE_ID}*_dnbr6.tif 1> /dev/null 2>&1; then
        echo_error "MTBS dnbr6 file not found. Expected: ${FIRE_ID}_*_dnbr6.tif"
        exit 1
    fi

    echo_step "MTBS data downloaded successfully"
}

# Alternative: Use fixture data for development
use_fixture_data() {
    echo_step "Creating synthetic fixture data for development..."

    # Create a simple test GeoTIFF if real data not available
    # This is a 256x256 raster with severity values 1-6

    FIXTURE_FILE="cedar_creek_fixture.tif"

    if [ -f "${FIXTURE_FILE}" ]; then
        echo_warn "Fixture already exists, skipping creation"
        return 0
    fi

    python3 << 'PYTHON'
import numpy as np

try:
    from osgeo import gdal, osr
except ImportError:
    print("GDAL Python bindings not available, skipping fixture creation")
    exit(0)

# Cedar Creek approximate bounds (EPSG:3857)
# Center: -122.3, 43.95 (lon, lat)
x_min = -13620000
y_max = 5480000
pixel_size = 100  # 100m resolution
width = 256
height = 256

# Create random severity data (1-6)
np.random.seed(42)
data = np.random.randint(1, 7, (height, width), dtype=np.uint8)

# Create GeoTIFF
driver = gdal.GetDriverByName('GTiff')
ds = driver.Create('cedar_creek_fixture.tif', width, height, 1, gdal.GDT_Byte)

# Set geotransform
ds.SetGeoTransform([x_min, pixel_size, 0, y_max, 0, -pixel_size])

# Set projection (Web Mercator)
srs = osr.SpatialReference()
srs.ImportFromEPSG(3857)
ds.SetProjection(srs.ExportToWkt())

# Write data
ds.GetRasterBand(1).WriteArray(data)
ds.GetRasterBand(1).SetNoDataValue(0)

ds = None
print("Created fixture: cedar_creek_fixture.tif")
PYTHON

    echo_step "Fixture data created"
}

# Inspect source data
inspect_source() {
    echo_step "Inspecting source data..."

    SOURCE_FILE=$(ls ${FIRE_ID}*_dnbr6.tif 2>/dev/null | head -1 || echo "cedar_creek_fixture.tif")

    if [ ! -f "${SOURCE_FILE}" ]; then
        echo_error "No source file found"
        exit 1
    fi

    echo "  Source file: ${SOURCE_FILE}"
    gdalinfo "${SOURCE_FILE}" | grep -E "(Driver|Size|Coordinate System|Origin|Pixel Size)" || true

    export SOURCE_FILE
}

# Reproject to Web Mercator if needed
reproject_data() {
    echo_step "Checking projection..."

    SOURCE_FILE=$(ls ${FIRE_ID}*_dnbr6.tif 2>/dev/null | head -1 || echo "cedar_creek_fixture.tif")
    REPROJECTED="cedar_creek_severity_3857.tif"

    # Check if already Web Mercator
    PROJ=$(gdalinfo "${SOURCE_FILE}" | grep -i "EPSG:3857" || echo "")

    if [ -n "${PROJ}" ]; then
        echo_warn "Already in EPSG:3857, skipping reprojection"
        cp "${SOURCE_FILE}" "${REPROJECTED}"
    else
        echo_step "Reprojecting to EPSG:3857 (Web Mercator)..."
        gdalwarp \
            -t_srs EPSG:3857 \
            -r near \
            -co COMPRESS=LZW \
            "${SOURCE_FILE}" \
            "${REPROJECTED}"
    fi

    echo_step "Reprojection complete"
}

# Convert to Cloud-Optimized GeoTIFF
create_cog() {
    echo_step "Converting to Cloud-Optimized GeoTIFF..."

    gdal_translate \
        -of COG \
        -co TILING_SCHEME=GoogleMapsCompatible \
        -co COMPRESS=LZW \
        -co OVERVIEW_RESAMPLING=NEAREST \
        -co BLOCKSIZE=256 \
        -co NUM_THREADS=ALL_CPUS \
        -co BIGTIFF=IF_SAFER \
        cedar_creek_severity_3857.tif \
        "${OUTPUT_COG}"

    echo_step "COG created: ${OUTPUT_COG}"
}

# Validate COG structure
validate_cog() {
    echo_step "Validating COG structure..."

    # Run rio-cogeo validate
    if rio cogeo validate --strict "${OUTPUT_COG}"; then
        echo_step "COG validation PASSED"
    else
        echo_error "COG validation FAILED"
        exit 1
    fi

    # Check structure with gdalinfo
    echo ""
    echo "  COG Structure:"
    gdalinfo "${OUTPUT_COG}" | grep -E "(Driver|LAYOUT|BLOCK|COMPRESS|Overview)" || true

    # File size
    SIZE=$(ls -lh "${OUTPUT_COG}" | awk '{print $5}')
    echo "  File size: ${SIZE}"
}

# Summary
print_summary() {
    echo ""
    echo "=============================================="
    echo_step "COG Processing Complete!"
    echo "=============================================="
    echo ""
    echo "  Output: ${WORK_DIR}/${OUTPUT_COG}"
    echo ""
    echo "  Next steps:"
    echo "    1. Run: ./scripts/setup-geospatial-bucket.sh"
    echo "    2. Upload COG to GCS"
    echo "    3. Deploy TiTiler to Cloud Run"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_workspace

    # Try real data first, fall back to fixture
    if ls ${FIRE_ID}*_dnbr6.tif 1> /dev/null 2>&1; then
        echo_step "Using real MTBS data"
    else
        echo_warn "Real MTBS data not found, using fixture data"
        use_fixture_data
    fi

    inspect_source
    reproject_data
    create_cog
    validate_cog
    print_summary
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

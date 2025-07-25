# Phase 2 Testing Guide - User Manual

## Overview
This guide provides step-by-step instructions for testing all Phase 2 features that are now accessible through the user interface. The backend systems are fully functional, and we've created comprehensive UI components to make all features testable.

## Quick Start - What's Now Available

### ✅ NEWLY ACCESSIBLE FEATURES
- **File Upload Analysis** - Upload lab reports, CSV files, and images
- **Structured Health Assessment** - Comprehensive biomarker and symptom input
- **Health Dashboard** - Centralized view of all analyses and trends
- **Results Visualization** - Detailed analysis results with Ray Peat insights
- **Memory-Enhanced Chat** - Contextual conversations (existing, improved)

## Testing Workflows

### 1. COMPREHENSIVE FILE UPLOAD TESTING

**Access**: Navigate to `/upload` or click "Upload Data" in navigation

**Test Scenario A: PDF Lab Report**
1. Click "Upload Data" in navigation
2. Fill in user information:
   - Email: `test@example.com`
   - Initials: `J.D.`
   - Age: `35`
   - City: `New York`
3. Upload a PDF lab report (or create a sample PDF with biomarker data)
4. Click "Upload & Analyze"
5. **Expected Result**: Comprehensive analysis with Ray Peat insights

**Test Scenario B: CSV Biomarker Data**
1. Create a CSV file with biomarker data:
   ```csv
   Biomarker,Value,Unit
   TSH,2.5,mIU/L
   Free T3,3.2,pg/mL
   Free T4,1.1,ng/dL
   Cortisol,15,μg/dL
   ```
2. Upload via the same interface
3. **Expected Result**: Structured biomarker analysis

**Test Scenario C: Image Upload**
1. Take a photo of a lab report or create a sample image
2. Upload JPG/PNG file
3. **Expected Result**: OCR processing and analysis

### 2. STRUCTURED HEALTH ASSESSMENT TESTING

**Access**: Navigate to `/assessment` or click "Assessment" in navigation

**Complete Assessment Workflow**:

**Step 1: Biomarkers Tab**
1. Select common biomarkers from dropdown (TSH, Free T3, etc.)
2. Enter values and units
3. Add multiple biomarkers
4. **Test**: Remove and re-add biomarkers

**Step 2: Symptoms Tab**
1. Click on common symptoms (Fatigue, Brain fog, etc.)
2. Add custom symptoms
3. **Test**: Remove symptoms by clicking the badge

**Step 3: Lifestyle Tab**
1. Fill in diet description
2. Describe exercise routine
3. Detail sleep patterns
4. Explain stress levels

**Step 4: Goals & Analysis Tab**
1. Select health goals
2. Add custom goals
3. Configure analysis settings:
   - Enable/disable memory enhancement
   - Select analysis depth (Layer 1-3)
4. Click "Generate Memory-Enhanced Analysis"

**Expected Result**: Comprehensive analysis with personalized recommendations

### 3. HEALTH DASHBOARD TESTING

**Access**: Navigate to `/dashboard` or click "Dashboard" in navigation

**Dashboard Features to Test**:

**Overview Stats**
- Total Sessions counter
- Health Journey Entries
- Memory Entries
- Insights Generated

**Health Trends Tab**
- View biomarker trends over time
- Trend direction indicators
- Percentage changes

**Recent Sessions Tab**
- Analysis session history
- Session types and status
- Biomarker counts

**Memory Insights Tab**
- Memory system statistics
- Analysis activity summary
- Memory enhancement benefits

**Quick Actions**
- Test all quick action buttons
- Verify navigation to other pages

### 4. MEMORY-ENHANCED CHAT TESTING

**Access**: Navigate to `/memory` or click "Memory Chat" in navigation

**Enhanced Testing Scenarios**:

**Scenario A: First-Time User**
1. Enter User ID: `test-user-001`
2. Enter query: "Analyze my thyroid function"
3. Add lab data:
   ```
   TSH: 3.2
   Free T3: 2.8
   Free T4: 1.0
   ```
4. Click "Analyze with Memory"
5. **Expected**: Basic analysis without historical context

**Scenario B: Returning User**
1. Use same User ID from previous session
2. Enter new query: "How have my thyroid levels changed?"
3. Add new lab data with different values
4. **Expected**: Contextual analysis comparing to previous data

**Scenario C: Health Journey Loading**
1. Click "Load Health Journey"
2. **Expected**: Historical trend visualization

### 5. RESULTS PAGE TESTING

**Access**: Results pages are accessed automatically after analyses or via direct links

**Features to Test**:

**Summary Tab**
- Analysis summary
- Positive indicators
- Risk factors

**Biomarkers Tab**
- Individual biomarker analysis
- Status indicators (normal, high, low, optimal)
- Ray Peat interpretations

**Detailed Analysis Tab**
- Comprehensive analysis text
- Ray Peat bioenergetic insights

**Recommendations Tab**
- Immediate actions
- Next steps

**Context Tab**
- Patient information
- Memory enhancement details
- Analysis metadata

**Additional Features**
- Download report functionality
- Share analysis results

## Sample Test Data

### Sample Biomarker Values for Testing
```
TSH: 2.5 mIU/L
Free T3: 3.2 pg/mL
Free T4: 1.1 ng/dL
Reverse T3: 15 ng/dL
Cortisol: 12 μg/dL
DHEA-S: 200 μg/dL
Pregnenolone: 50 ng/dL
Progesterone: 1.2 ng/mL
Estradiol: 45 pg/mL
Testosterone: 450 ng/dL
Vitamin D: 35 ng/mL
B12: 450 pg/mL
Folate: 8 ng/mL
Ferritin: 75 ng/mL
Glucose: 85 mg/dL
Insulin: 8 μIU/mL
HbA1c: 5.2%
```

### Sample CSV File Content
```csv
Biomarker,Value,Unit,Date
TSH,2.5,mIU/L,2024-01-15
Free T3,3.2,pg/mL,2024-01-15
Free T4,1.1,ng/dL,2024-01-15
Cortisol,12,μg/dL,2024-01-15
Vitamin D,35,ng/mL,2024-01-15
```

## Troubleshooting

### Common Issues and Solutions

**Issue**: "Analysis failed" error
**Solution**: 
- Check that all required fields are filled
- Ensure file size is under 10MB
- Verify file format is supported (PDF, CSV, JPG, PNG)

**Issue**: No memory context in results
**Solution**:
- Ensure "Enable Memory Enhancement" is checked
- Use consistent User ID across sessions
- Complete multiple analyses to build context

**Issue**: Empty dashboard
**Solution**:
- Complete at least one analysis first
- Check that User ID matches previous sessions
- Verify API endpoints are responding

**Issue**: File upload not working
**Solution**:
- Check file format and size
- Ensure all user information fields are completed
- Try with a different file type

## Success Criteria

### Phase 2 Feature Testing Checklist

- [ ] **File Upload**: Successfully upload and analyze PDF, CSV, and image files
- [ ] **Structured Assessment**: Complete full assessment workflow with biomarkers, symptoms, lifestyle, and goals
- [ ] **Dashboard**: View comprehensive health dashboard with stats, trends, and history
- [ ] **Memory Chat**: Conduct contextual conversations with memory enhancement
- [ ] **Results Visualization**: View detailed analysis results with Ray Peat insights
- [ ] **Navigation**: Seamlessly navigate between all pages
- [ ] **Data Persistence**: Verify that user data and sessions persist across interactions
- [ ] **Error Handling**: Test error scenarios and verify appropriate error messages

## Advanced Testing Scenarios

### Multi-Session Testing
1. Complete analysis as User A
2. Switch to User B, complete different analysis
3. Return to User A, verify personalized context
4. Test cross-user data isolation

### Longitudinal Testing
1. Complete initial analysis
2. Wait or simulate time passage
3. Complete follow-up analysis with different values
4. Verify trend analysis and progression tracking

### Edge Case Testing
1. Upload very large files (test size limits)
2. Enter extreme biomarker values
3. Use special characters in text fields
4. Test with empty or minimal data

## API Testing (Advanced Users)

### Direct API Testing
If you want to test the backend APIs directly:

```bash
# Test comprehensive analysis
curl -X POST http://localhost:3000/api/comprehensive-analysis \
  -F "file=@sample_lab_report.pdf" \
  -F "email=test@example.com" \
  -F "initials=J.D." \
  -F "age=35" \
  -F "city=New York"

# Test memory-enhanced analysis
curl -X POST http://localhost:3000/api/health/memory-enhanced-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentData": {
      "type": "comprehensive",
      "biomarkers": [{"name": "TSH", "value": 2.5, "unit": "mIU/L"}]
    },
    "enableMemoryEnhancement": true,
    "layerPreference": 2
  }'
```

## Feedback and Reporting

### What to Test and Report
1. **Functionality**: Does each feature work as expected?
2. **User Experience**: Is the interface intuitive and easy to use?
3. **Performance**: Are analyses completed in reasonable time?
4. **Accuracy**: Are Ray Peat insights relevant and helpful?
5. **Memory Integration**: Does the system remember and use previous interactions?

### Bug Reporting Format
When reporting issues, please include:
- **Page/Feature**: Which page or feature had the issue
- **Steps to Reproduce**: Exact steps that led to the problem
- **Expected Result**: What should have happened
- **Actual Result**: What actually happened
- **Browser/Device**: Your testing environment
- **Screenshots**: If applicable

## Next Steps After Testing

After completing Phase 2 testing:
1. **Document Results**: Record which features work well and which need improvement
2. **Identify Gaps**: Note any missing functionality or user experience issues
3. **Prioritize Improvements**: Rank issues by severity and user impact
4. **Plan Phase 3**: Use testing feedback to inform Phase 3 development priorities

---

**Note**: The development server is running on `http://localhost:3000`. All Phase 2 features are now accessible and testable through the user interface.

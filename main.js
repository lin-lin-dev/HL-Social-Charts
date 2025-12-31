// main.js - Hogwarts Social Network Visualization

// Configuration
const width = 1920;  // 100% viewport width
const height = 1080; // 100% viewport height
const nodeSize = 40;
const nodeTextHeight = 30;
const nodeTotalHeight = nodeSize + nodeTextHeight;

// Group colors matching your image
const groupColors = {
    'Slytherin': '#1a5f3b',
    'Ravenclaw': '#1e3a8a',
    'Gryffindor': '#991b1b',
    'Hufflepuff': '#ca8a04',
    'Hogwarts Staff': '#6b7280',
    'Other Hogwarts': '#9ca3af',
    'NPCs Outside': '#4b5563',
    'Non-Academic Residents': '#8b5cf6'
};

// Status colors
const statusColors = {
    'Friend': '#00a46dff',
    'Cordial': '#90f8d5ff',
    'Best Friend': '#006241ff',
    'Companion': '#006241ff',
    'Rival': '#b55e16ff',
    'Dislike': '#b55e16ff',
    'Enemy': '#821818ff',
    'Hate': '#821818ff',
    'Family': '#3b82f6',
    'LoveInterest': '#ff7af6ff',
    'Familiar': '#6b7280',
    'default': '#9ca3af'
};

//MARK: REGIONS

// Heights for each section
const staffPureHeight = 120;      // Pure staff (no house)
const staffHouseHeight = 250;     // Staff + House overlap
const studentHeight = 450;        // Students (all have houses)
const residentHouseHeight = 100;  // Residents + House overlap
const residentPureHeight = 80;    // Pure residents (no house)

const hogwarts = { 
    x: 0, 
    y: 0, 
    width: width, 
    height:  staffPureHeight + staffHouseHeight + studentHeight + residentHouseHeight + residentPureHeight + 100
};

// Calculate sections within Hogwarts
const sectionPadding = 50;
const innerWidth = hogwarts.width - (sectionPadding * 2);

// Calculate Y positions (top to bottom)
let currentY = hogwarts.y + sectionPadding;

// 1. Pure Staff section (top, full width)
const staffPure = {
    x: hogwarts.x + sectionPadding, // TODO: maybe this
    y: currentY,
    width: innerWidth,
    height: staffPureHeight
};
currentY += staffPureHeight + 10;

// 2. Staff + House sections (4 columns)
const columnGap = 5;
const columnWidth = (innerWidth - (3 * columnGap)) / 4;

const staffSlytherin = {
    x: hogwarts.x + sectionPadding,
    y: currentY,
    width: columnWidth,
    height: staffHouseHeight
};

const staffRavenclaw = {
    x: staffSlytherin.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: staffHouseHeight
};

const staffHufflepuff = {
    x: staffRavenclaw.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: staffHouseHeight
};

const staffGryffindor = {
    x: staffHufflepuff.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: staffHouseHeight
};

currentY += staffHouseHeight; // Add + # for gap between Staff and Students

// 3. Student + House sections (4 columns, all students have houses)
const studentSlytherin = {
    x: hogwarts.x + sectionPadding,
    y: currentY,
    width: columnWidth,
    height: studentHeight
};

const studentRavenclaw = {
    x: studentSlytherin.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: studentHeight
};

const studentHufflepuff = {
    x: studentRavenclaw.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: studentHeight
};

const studentGryffindor = {
    x: studentHufflepuff.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: studentHeight
};
currentY += studentHeight;

// 4. Resident + House sections (4 columns)
const residentSlytherin = {
    x: hogwarts.x + sectionPadding,
    y: currentY,
    width: columnWidth,
    height: residentHouseHeight
};

const residentRavenclaw = {
    x: residentSlytherin.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: residentHouseHeight
};

const residentHufflepuff = {
    x: residentRavenclaw.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: residentHouseHeight
};

const residentGryffindor = {
    x: residentHufflepuff.x + columnWidth + columnGap,
    y: currentY,
    width: columnWidth,
    height: residentHouseHeight
};
currentY += residentHouseHeight + 10;

// 5. Pure Residents section (bottom, full width)
const residentPure = {
    x: hogwarts.x + sectionPadding,
    y: currentY,
    width: innerWidth,
    height: residentPureHeight
};

// Outside of Hogwarts (remaining 25% of height)
const outsideOfHogwarts = {
    x: 0,
    y: hogwarts.height + 20,
    width: width,
    height: height * 0.25 - 20
};

// Pre-defined group regions
const groupRegions = {
    'Hogwarts': hogwarts,
    'Outside of Hogwarts': outsideOfHogwarts,
    'Hogwarts Staff': staffPure,
    'Non-Academic Residents': residentPure,
    'Hogwarts Staff+Slytherin': staffSlytherin,
    'Hogwarts Staff+Ravenclaw': staffRavenclaw,
    'Hogwarts Staff+Hufflepuff': staffHufflepuff,
    'Hogwarts Staff+Gryffindor': staffGryffindor,
    'Student+Slytherin': studentSlytherin,
    'Student+Ravenclaw': studentRavenclaw,
    'Student+Hufflepuff': studentHufflepuff,
    'Student+Gryffindor': studentGryffindor,
    'Non-Academic Residents+Slytherin': residentSlytherin,
    'Non-Academic Residents+Ravenclaw': residentRavenclaw,
    'Non-Academic Residents+Hufflepuff': residentHufflepuff,
    'Non-Academic Residents+Gryffindor': residentGryffindor,
};

// Visual groupings for display (combining related regions)
// im pretty sure this is unused but leaving it here for now
const visualGroups = [
    {
        name: 'Hogwarts Staff',
        regions: [staffPure, staffSlytherin, staffRavenclaw, staffHufflepuff, staffGryffindor],
        color: groupColors['Hogwarts Staff']
    },
    {
        name: 'Students',
        regions: [studentSlytherin, studentRavenclaw, studentHufflepuff, studentGryffindor],
        color: groupColors['Gryffindor']  // We'll color by house
    },
    {
        name: 'Non-Academic Residents',
        regions: [residentSlytherin, residentRavenclaw, residentHufflepuff, residentGryffindor, residentPure],
        color: groupColors['Non-Academic Residents']
    },
    {
        name: 'Outside of Hogwarts',
        regions: [outsideOfHogwarts],
        color: groupColors['NPCs Outside']
    }
];

// House columns for coloring
const houseColumns = [
    { name: 'Slytherin', regions: [staffSlytherin, studentSlytherin, residentSlytherin], color: groupColors['Slytherin'] },
    { name: 'Ravenclaw', regions: [staffRavenclaw, studentRavenclaw, residentRavenclaw], color: groupColors['Ravenclaw'] },
    { name: 'Hufflepuff', regions: [staffHufflepuff, studentHufflepuff, residentHufflepuff], color: groupColors['Hufflepuff'] },
    { name: 'Gryffindor', regions: [staffGryffindor, studentGryffindor, residentGryffindor], color: groupColors['Gryffindor'] }
];

// MARK: - D3 Visualization Setup
const container = d3.select('#visualization');
const svg = d3.select('#svg')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g');
const zoom = d3.zoom()
    .scaleExtent([0.5, 4])
    .on('zoom', (event) => {
        g.attr('transform', event.transform);
    });

svg.call(zoom);

// Create layers
const groupsLayer = g.append('g').attr('class', 'groups');
const linksLayer = g.append('g').attr('class', 'links');
const nodesLayer = g.append('g').attr('class', 'nodes');

// Define arrow markers (both single and double-ended)
const defs = svg.append('defs');
Object.keys(statusColors).forEach(status => {
    // Single arrow (for one-way relationships)
    defs.append('marker')
        .attr('id', `arrow-${status}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', statusColors[status] || statusColors.default)
        .attr('d', 'M0,-5L10,0L0,5');

    // Start arrow (for bidirectional relationships)
    defs.append('marker')
        .attr('id', `arrow-start-${status}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', -5)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', statusColors[status] || statusColors.default)
        .attr('d', 'M10,-5L0,0L10,5');
});

// Helper function to determine the correct region key for a node
function getRegionKey(groups) {
    if (groups.length === 1) {
        // Single group
        if (groups[0] === 'Outside of Hogwarts') return 'Outside of Hogwarts';
        return groups[0]; // Will be mapped below
    }
    
    const houses = ['Slytherin', 'Ravenclaw', 'Gryffindor', 'Hufflepuff'];
    const house = groups.find(g => houses.includes(g));
    
    if (groups.includes('Hogwarts Staff')) {
        return house ? `Hogwarts Staff+${house}` : 'Hogwarts Staff';
    }
    
    if (groups.includes('Student')) {
        return house ? `Student+${house}` : 'Student+Gryffindor'; // Default to Gryffindor if no house
    }
    
    if (groups.includes('Non-Academic Residents')) {
        return house ? `Non-Academic Residents+${house}` : 'Non-Academic Residents';
    }
    
    return groups[0];
}

// MARK: load Data initial
// Load and process data
async function loadData() {
    try {
        const relationships = await d3.csv('relationships.csv');
        const [socialGroups, characters] = await Promise.all([
            d3.json('social.json'),
            d3.json('characters.json')
        ]);

        const characterMap = new Map(characters.map(c => [c.CharacterID, c]));
        const socialMap = new Map(socialGroups.map(s => [s.CharacterID, s]));

        const allCharacterIds = new Set([
            ...relationships.map(r => r.CharacterID),
            ...relationships.map(r => r.TargetCharacterID)
        ]);

        const regionCounts = new Map();
        const regionPositionCounters = new Map();
        
        allCharacterIds.forEach(id => {
            const socialInfo = socialMap.get(id);
            const groups = socialInfo?.Groups || ['Outside of Hogwarts'];
            const regionKey = getRegionKey(groups);
            regionCounts.set(regionKey, (regionCounts.get(regionKey) || 0) + 1);
        });

        Object.keys(groupRegions).forEach(key => {
            regionPositionCounters.set(key, 0);
        });

        const nodes = Array.from(allCharacterIds).map(id => {
            const charInfo = characterMap.get(id);
            const socialInfo = socialMap.get(id);
            const groups = socialInfo?.Groups || ['Outside of Hogwarts'];
            const regionKey = getRegionKey(groups);
            
            const positionIndex = regionPositionCounters.get(regionKey) || 0;
            regionPositionCounters.set(regionKey, positionIndex + 1);
            
            const position = calculateInitialPosition(regionKey, positionIndex, regionCounts.get(regionKey) || 1);
            
            return {
                id,
                name: charInfo?.Name || id.replace(/([A-Z])/g, ' $1').trim(),
                image: charInfo?.image,
                groups,
                regionKey,
                x: position.x,
                y: position.y,
                region: position.region,
                fx: null,
                fy: null
            };
        });

                // Process links to detect mutual relationships
        const linkMap = new Map();
        
        relationships.forEach(r => {
            const key = `${r.CharacterID}->${r.TargetCharacterID}`;
            const reverseKey = `${r.TargetCharacterID}->${r.CharacterID}`;
            
            linkMap.set(key, {
                source: r.CharacterID,
                target: r.TargetCharacterID,
                status: r.SocialCapitalStatus,
                capital: +r.SocialCapital
            });
        });
        
        // Consolidate mutual relationships
        const links = [];
        const processed = new Set();
        
        linkMap.forEach((link, key) => {
            if (processed.has(key)) return;
            
            const reverseKey = `${link.target}->${link.source}`;
            const reverseLink = linkMap.get(reverseKey);
            
            if (reverseLink && reverseLink.status === link.status) {
                // Mutual relationship with same status
                links.push({
                    source: link.source,
                    target: link.target,
                    status: link.status,
                    capital: link.capital,
                    isMutual: true
                });
                processed.add(key);
                processed.add(reverseKey);
            } else {
                // One-way relationship
                links.push({
                    source: link.source,
                    target: link.target,
                    status: link.status,
                    capital: link.capital,
                    isMutual: false
                });
                processed.add(key);
            }
        });

        // Setup filters
        setupFilters(nodes, links);

        createVisualization(nodes, links);

        //applyFilters();

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data files. Make sure relationships.csv, social.json, and characters.json are in the same folder.');
    }
}

function calculateInitialPosition(regionKey, positionIndex, totalInGroup) {
    const targetRegion = groupRegions[regionKey] || groupRegions['Outside of Hogwarts'];
    
    const cols = Math.ceil(Math.sqrt(totalInGroup));
    const row = Math.floor(positionIndex / cols);
    const col = positionIndex % cols;
    
    const padding = 10;
    const cellWidth = (targetRegion.width - padding * 2) / cols;
    const cellHeight = (targetRegion.height - padding * 2) / Math.ceil(totalInGroup / cols);
    
    return {
        x: targetRegion.x + padding + col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * 15,
        y: targetRegion.y + padding + row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * 15,
        region: targetRegion
    };
}

function createVisualization(nodes, links) {
    // Draw Hogwarts container
    // MARK: Hogwarts Box
    groupsLayer.append('rect')
        .attr('x', hogwarts.x)
        .attr('y', hogwarts.y)
        .attr('width', hogwarts.width)
        .attr('height', hogwarts.height)
        .attr('fill', '#f3f4f6')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 3)
        .attr('rx', 10);
    
    groupsLayer.append('text')
        .attr('x', hogwarts.x + 20)
        .attr('y', hogwarts.y + 30)
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text('Hogwarts');

    // Draw overlapping boxes - Staff (full width horizontal box)
    // MARK: Staff Box
    const staffFullBox = {
        x: staffPure.x,
        y: staffPure.y,
        width: staffPure.width,
        height: staffPure.height + staffSlytherin.height + 10
    };
    groupsLayer.append('rect')
        .attr('x', staffFullBox.x)
        .attr('y', staffFullBox.y)
        .attr('width', staffFullBox.width)
        .attr('height', staffFullBox.height)
        .attr('fill', groupColors['Hogwarts Staff'])
        .attr('fill-opacity', 0.15)
        .attr('stroke', groupColors['Hogwarts Staff'])
        .attr('stroke-width', 3)
        .attr('rx', 10);

    groupsLayer.append('text')
        .attr('x', staffFullBox.x - 180)
        .attr('y', staffFullBox.y + staffFullBox.height / 2)
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', groupColors['Hogwarts Staff'])
        .text('Hogwarts Staff');

    // Draw Students horizontal box
    // MARK: Students Box
    const studentFullBox = {
        x: studentSlytherin.x,
        y: studentSlytherin.y,
        width: studentGryffindor.x + studentGryffindor.width - studentSlytherin.x,
        height: studentSlytherin.height
    };
    groupsLayer.append('rect')
        .attr('x', studentFullBox.x)
        .attr('y', studentFullBox.y)
        .attr('width', studentFullBox.width)
        .attr('height', studentFullBox.height)
        .attr('fill', '#4b5563')
        .attr('fill-opacity', 0.1)
        .attr('stroke', '#4b5563')
        .attr('stroke-width', 3)
        .attr('rx', 10);
    
    groupsLayer.append('text')
        .attr('x', studentFullBox.x - 140)
        .attr('y', studentFullBox.y + studentFullBox.height / 2)
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', '#4b5563')
        .text('Students');

    // Draw Residents (full width horizontal box)
    // MARK: Residents Box
    const residentFullBox = {
        x: residentSlytherin.x,
        y: residentSlytherin.y,
        width: residentGryffindor.x + residentGryffindor.width - residentSlytherin.x,
        height: residentSlytherin.height + residentPure.height + 10
    };
    groupsLayer.append('rect')
        .attr('x', residentFullBox.x)
        .attr('y', residentFullBox.y)
        .attr('width', residentFullBox.width)
        .attr('height', residentFullBox.height)
        .attr('fill', groupColors['Non-Academic Residents'])
        .attr('fill-opacity', 0.15)
        .attr('stroke', groupColors['Non-Academic Residents'])
        .attr('stroke-width', 3)
        .attr('rx', 10);

    groupsLayer.append('text')
        .attr('x', residentFullBox.x - 260)
        .attr('y', residentFullBox.y + residentFullBox.height / 2)
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', groupColors['Non-Academic Residents'])
        .text('Non-Academic Residents');

    // MARK: House Columns
    // Draw house columns (vertical boxes that overlap with staff/students/residents)
    houseColumns.forEach(house => {
        const topRegion = house.regions[0]; // staffHouse
        const bottomRegion = house.regions[2]; // residentHouse
        
        const houseFullBox = {
            x: topRegion.x,
            y: topRegion.y,
            width: topRegion.width,
            height: bottomRegion.y + bottomRegion.height - topRegion.y
        };
        
        groupsLayer.append('rect')
            .attr('x', houseFullBox.x)
            .attr('y', houseFullBox.y)
            .attr('width', houseFullBox.width)
            .attr('height', houseFullBox.height)
            .attr('fill', house.color)
            .attr('fill-opacity', 0.15)
            .attr('stroke', house.color)
            .attr('stroke-width', 3)
            .attr('rx', 10);
        
        groupsLayer.append('text')
            .attr('x', houseFullBox.x + houseFullBox.width / 2)
            .attr('y', houseFullBox.y - 10) // House label
            .attr('font-size', 16)
            .attr('font-weight', 'bold')
            .attr('fill', house.color)
            .attr('text-anchor', 'middle')
            .text(house.name);
    });

    // Draw outside section
    // MARK: Outside Box
    groupsLayer.append('rect')
        .attr('x', outsideOfHogwarts.x)
        .attr('y', outsideOfHogwarts.y)
        .attr('width', outsideOfHogwarts.width)
        .attr('height', outsideOfHogwarts.height)
        .attr('fill', groupColors['NPCs Outside'])
        .attr('fill-opacity', 0.15)
        .attr('stroke', groupColors['NPCs Outside'])
        .attr('stroke-width', 3)
        .attr('rx', 10);
    
    groupsLayer.append('text')
        .attr('x', outsideOfHogwarts.x + 20)
        .attr('y', outsideOfHogwarts.y + 25)
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', groupColors['NPCs Outside'])
        .text('Outside of Hogwarts');

    // Force simulation
    // MARK: Force Simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links)
            .id(d => d.id)
            .distance(d => {
                const sourceNode = nodes.find(n => n.id === d.source.id || n.id === d.source);
                const targetNode = nodes.find(n => n.id === d.target.id || n.id === d.target);
                
                if (sourceNode && targetNode && sourceNode.regionKey === targetNode.regionKey) {
                    return 120;
                } else {
                    return 250;
                }
            })
            .strength(0.1))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('collision', d3.forceCollide().radius(70))
        .force('boundary', forceStrictBoundary())
        .alphaDecay(0.01)
        .velocityDecay(0.4);

    currentSimulation = simulation;

    function forceStrictBoundary() {
        return function(alpha) {
            nodes.forEach(node => {
                if (node.fx !== null && node.fy !== null) {
                    return;
                }
                
                if (node.region) {
                    const padding = 10;
                    const minX = node.region.x + padding;
                    const maxX = node.region.x + node.region.width - padding;
                    const minY = node.region.y + padding;
                    const maxY = node.region.y + node.region.height - padding;
                    
                    if (node.x < minX) node.x = minX;
                    if (node.x > maxX) node.x = maxX;
                    if (node.y < minY) node.y = minY;
                    if (node.y > maxY) node.y = maxY;
                    
                    if (node.vx) {
                        if ((node.x <= minX && node.vx < 0) || (node.x >= maxX && node.vx > 0)) {
                            node.vx = 0;
                        }
                    }
                    if (node.vy) {
                        if ((node.y <= minY && node.vy < 0) || (node.y >= maxY && node.vy > 0)) {
                            node.vy = 0;
                        }
                    }
                }
            });
        };
    }

    // MARK: Draw Links and Nodes
    // Draw nodes
    const nodeGroup = nodesLayer.selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    // Draw links
    /** 
    const linkSel = linksLayer.selectAll('.link-group')
    .data(links, d => (d.source.id || d.source) + '-' + (d.target.id || d.target));

    const linkEnter = linkSel.enter().append('g')
    .attr('class', 'link-group');

    const { linkPath, linkLabelGroup } = setupLinkVisuals(linkEnter);
    */

    setupNodeVisuals(nodeGroup);

      // Save selections for reuse
    nodeSelection = nodeGroup;
    linkPathSelection = d3.selectAll();  // empty selection
    //linkSel.select('path').merge(linkPath);
    linkLabelGroupSelection = d3.selectAll();  // empty selection
    //linkSel.select('.link-label-group').merge(linkLabelGroup);

    simulation.on('tick', () => {
        // Fresh data every tick for filtering
        const currentLinks = currentSimulation.force('link').links();
        const linksBySource = d3.group(currentLinks, d => d.source.id || d.source);
        
        linkPathSelection.attr('d', d => getLinkPath(d, linksBySource, currentLinks));

        linkLabelGroupSelection.attr('transform', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const x = d.source.x + dx * 0.5;
            const y = d.source.y + dy * 0.5;
            return `translate(${x},${y})`;
        });

        // label backgrounds...
        linkLabelGroupSelection.each(function() {
            const group = d3.select(this);
            const text = group.select('text');
            const bg = group.select('rect');
            const bbox = text.node().getBBox();
            bg.attr('x', bbox.x - 4)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 4);
        });

        nodeSelection.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Let simulation settle (nodes spread nicely)
  setTimeout(() => {
    console.log('Initial node layout complete');
  }, 100);

}


// MARK: Filtering
// Global variables for filtering
let allNodes = [];
let allLinks = [];
let currentSimulation = null;

let nodeSelection = null;
let linkPathSelection = null;
let linkLabelGroupSelection = null;

function setupFilters(nodes, links) {
    allNodes = nodes;
    allLinks = links;
    
    // Populate focus dropdown
    const focusSelect = document.getElementById('focus-select');
    if (!focusSelect) {
        console.error('Element #focus-select not found in DOM');
        return;
    }

    const sortedNodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedNodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        focusSelect.appendChild(option);
    });
    
    // Add event listeners
    focusSelect.addEventListener('change', applyFilters);
    
    // Checkbox listeners
    const checkboxes = [
        'filter-all', 'filter-staff', 'filter-students', 'filter-residents',
        'filter-outsiders', 'filter-slytherin', 'filter-ravenclaw',
        'filter-hufflepuff', 'filter-gryffindor'
    ];
    
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            if (id === 'filter-all') {
                handleAllCheckbox(e.target.checked);
            } else {
                applyFilters();
                updateAllCheckbox();
            }
        });
    });
    
    // Reset button
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

function handleAllCheckbox(checked) {
    const checkboxes = [
        'filter-staff', 'filter-students', 'filter-residents',
        'filter-outsiders', 'filter-slytherin', 'filter-ravenclaw',
        'filter-hufflepuff', 'filter-gryffindor'
    ];
    
    checkboxes.forEach(id => {
        document.getElementById(id).checked = checked;
    });
    
    applyFilters();
}

function updateAllCheckbox() {
    const checkboxes = [
        'filter-staff', 'filter-students', 'filter-residents',
        'filter-outsiders', 'filter-slytherin', 'filter-ravenclaw',
        'filter-hufflepuff', 'filter-gryffindor'
    ];
    
    const allChecked = checkboxes.every(id => document.getElementById(id).checked);
    document.getElementById('filter-all').checked = allChecked;
}

function resetFilters() {
    document.getElementById('focus-select').value = '';
    document.getElementById('filter-all').checked = true;
    handleAllCheckbox(true);
}

function applyFilters() {
  let focusId = document.getElementById('focus-select').value;
  
  if (!focusId) {
    focusId = null;
    console.log('No focus selected');
  }
  
  console.log('Applying filters with focusId: ', focusId);
  
  // Get active filters
  const filters = {
    staff: document.getElementById('filter-staff').checked,
    students: document.getElementById('filter-students').checked,
    residents: document.getElementById('filter-residents').checked,
    outsiders: document.getElementById('filter-outsiders').checked,
    slytherin: document.getElementById('filter-slytherin').checked,
    ravenclaw: document.getElementById('filter-ravenclaw').checked,
    hufflepuff: document.getElementById('filter-hufflepuff').checked,
    gryffindor: document.getElementById('filter-gryffindor').checked
  };

  // Filter nodes FIRST (focus + group filters)
  const visibleNodes = allNodes.filter(node => {
    // Focus filter - show focus + direct connections
    if (focusId && typeof focusId === 'string') {
      const isConnected = allLinks.some(link =>
        (link.source.id === focusId && link.target.id === node.id) ||
        (link.target.id === focusId && link.source.id === node.id) ||
        (link.source === focusId && link.target === node.id) ||
        (link.target === focusId && link.source === node.id)
      );
      if (node.id !== focusId && !isConnected) return false;
      if (node.id === focusId || focusId === true) return true;
    }
    
    // Group filters (your existing logic)
    const groups = node.groups;
    let roleMatch = false;
    if (filters.staff && groups.includes('Hogwarts Staff')) roleMatch = true;
    if (filters.students && groups.includes('Student')) roleMatch = true;
    if (filters.residents && groups.includes('Non-Academic Residents')) roleMatch = true;
    if (filters.outsiders && groups.includes('Outside of Hogwarts')) roleMatch = true;
    
    let houseMatch = false;
    if (filters.slytherin && groups.includes('Slytherin')) houseMatch = true;
    if (filters.ravenclaw && groups.includes('Ravenclaw')) houseMatch = true;
    if (filters.hufflepuff && groups.includes('Hufflepuff')) houseMatch = true;
    if (filters.gryffindor && groups.includes('Gryffindor')) houseMatch = true;
    
    const hasRole = groups.some(g => ['Hogwarts Staff', 'Student', 'Non-Academic Residents', 'Outside of Hogwarts'].includes(g));
    const hasHouse = groups.some(g => ['Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor'].includes(g));
    
    if (hasRole && !roleMatch) return false;
    if (hasHouse && !houseMatch) return false;
    
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  //  Filter links by FOCUS CONNECTION when focus is active
  const focusLinks = focusId ? allLinks.filter(link => {
    const s = link.source.id || link.source;
    const t = link.target.id || link.target;
    // Only keep links where ONE end is the focus node
    return (s === focusId && visibleNodeIds.has(t)) || (t === focusId && visibleNodeIds.has(s));
  }) : allLinks.filter(link => {
    // No focus: show all links between visible nodes (your original logic)
    const s = link.source.id || link.source;
    const t = link.target.id || link.target;
    return visibleNodeIds.has(s) && visibleNodeIds.has(t);
  });

  const filterFn = d => visibleNodeIds.has(d.id);
  
  // Pass filtered links instead of re-filtering in updateVisualizationComplex
  updateVisualizationComplex(allNodes, focusLinks, filterFn);
}

// MARK: Visualization Update
function updateVisualizationComplex(allNodes, filteredLinks, filterFn) {
    if (!currentSimulation) {
    console.warn('Simulation not initialized yet; skipping updateVisualizationComplex');
    return;
  }

      // 1. Filter your data based on current UI state
  const nodes = allNodes.filter(filterFn);         // keep only selected nodes
  const nodeIds = new Set(nodes.map(d => d.id));

  /** 
  const links = allLinks.filter(l => {
    const s = l.source.id || l.source;
    const t = l.target.id || l.target;
    return nodeIds.has(s) && nodeIds.has(t);       // keep links whose ends are visible
  });
  */

    const links = filteredLinks.filter(l => nodeIds.has(l.source.id || l.source) && nodeIds.has(l.target.id || l.target));

  // 2. Re-bind data to DOM (nodes)
  const nodeSel = nodesLayer
    .selectAll('.node')
    .data(nodes, d => d.id);

  nodeSel.exit().remove();

  //const nodeEnter = nodeSel.enter().append('g').attr('class', 'node');
  const nodeEnter = nodeSel.enter().append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded));

    // You may need to re-add rect/image/text for newly entered nodes.
    // For brevity, you can factor that node setup into a helper function
    // and call it from both create Visualization and here.
    setupNodeVisuals(nodeEnter);

    nodeSelection = nodeEnter.merge(nodeSel);

    const linkSel = linksLayer
        .selectAll('.link-group')
        .data(links, d => (d.source.id || d.source) + '-' + (d.target.id || d.target));

    linkSel.exit().remove();

    const linkEnter = linkSel.enter().append('g')
        .attr('class', 'link-group');

    const { linkPath: newLinkPath, linkLabelGroup: newLinkLabelGroup } = setupLinkVisuals(linkEnter);

    linkPathSelection = linkSel.select('path').merge(newLinkPath);
    linkLabelGroupSelection = linkSel.select('.link-label-group').merge(newLinkLabelGroup);

    // Update simulation with filtered data
    currentSimulation.nodes(nodes);
    currentSimulation.force('link').links(links);
    currentSimulation.alpha(0.5).restart();
}

// MARK: drawing
function setupLinkVisuals(linkEnter) {
  // linkEnter: selection of <g> for new links

  const linkPath = linkEnter.append('path')
    .attr('class', 'link-path')
    .attr('stroke', d => statusColors[d.status] || statusColors.default)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('opacity', 0.6)
    .attr('marker-end', d => `url(#arrow-${d.status})`)
    .attr('marker-start', d => d.isMutual ? `url(#arrow-start-${d.status})` : null);

  const linkLabelGroup = linkEnter.append('g')
    .attr('class', 'link-label-group');

  linkLabelGroup.append('rect')
    .attr('class', 'link-label-bg')
    .attr('fill', 'white')
    .attr('stroke', '#e5e7eb')
    .attr('stroke-width', 1)
    .attr('rx', 3);

  linkLabelGroup.append('text')
    .attr('class', 'link-label')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('font-size', 11)
    .attr('fill', '#374151')
    .text(d => {
      if (d.isMutual) {
        const pluralMap = {
          Friend: 'Friends',
          Rival: 'Rivals',
          Enemy: 'Enemies',
          Colleague: 'Colleagues',
          Family: 'Family Members',
        };
        return pluralMap[d.status] || d.status + 's';
      }
      return d.status;
    });

  return { linkPath, linkLabelGroup };
}

const square = false;
function getLinkPath(d, linksBySource, links) {
    if (square) {
         const source = d.source;
        const target = d.target;
        
        // Right angle at midpoint
        const mx = (source.x + target.x) / 2;
        const my = (source.y + target.y) / 2;
        
        return `M ${source.x},${source.y} L ${mx},${source.y} L ${mx},${target.y} L ${target.x},${target.y}`;
    } else {
        const source = d.source;
        const target = d.target;
        
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);
        
        const sourceLinks = Array.from(linksBySource.get(source.id) || []);
        const linkIndex = sourceLinks.findIndex(l => 
            (l.source.id || l.source) === source.id && 
            (l.target.id || l.target) === target.id &&
            l.status === d.status
        );
        
        const hasReverse = links.some(l => 
            (l.source.id || l.source) === target.id && 
            (l.target.id || l.target) === source.id
        );
        
        let spreadOffset = 0;
        if (sourceLinks.length > 1) {
            const totalLinks = sourceLinks.length;
            const linkPosition = linkIndex - (totalLinks - 1) / 2;
            spreadOffset = linkPosition * 25;
        }
        
        const bidirOffset = hasReverse ? 15 : 0;
        const totalOffset = spreadOffset + bidirOffset;
        
        const sourceRadius = nodeSize / 2 + 5;
        const targetRadius = nodeTotalHeight / 2 + 10;
        
        const sx = source.x + Math.cos(angle) * sourceRadius;
        const sy = source.y + Math.sin(angle) * sourceRadius;
        const tx = target.x - Math.cos(angle) * targetRadius;
        const ty = target.y - Math.sin(angle) * targetRadius;
        
        if (Math.abs(totalOffset) < 5) {
            return `M ${sx},${sy} L ${tx},${ty}`;
        } else {
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;
            const perpAngle = angle + Math.PI / 2;
            const cx = mx + Math.cos(perpAngle) * totalOffset;
            const cy = my + Math.sin(perpAngle) * totalOffset;
            return `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;
        }
    }  
}

function setupNodeVisuals(selection) {
  // selection is typically nodeGroup or nodeEnter.merge(nodeSel)

  selection.append('rect')
    .attr('class', 'node-bounds')
    .attr('width', nodeSize + 20)
    .attr('height', nodeTotalHeight + 10)
    .attr('x', -(nodeSize + 20) / 2)
    .attr('y', -nodeSize / 2)
    .attr('fill', 'none')
    .attr('pointer-events', 'all');

  selection.append('rect')
    .attr('width', nodeSize)
    .attr('height', nodeSize)
    .attr('x', -nodeSize / 2)
    .attr('y', -nodeSize / 2)
    .attr('fill', 'white')
    .attr('stroke', '#1f2937')
    .attr('stroke-width', 2)
    .attr('rx', 2);

  selection.each(function(d) {
    const node = d3.select(this);
    if (d.image) {
      node.append('image')
        .attr('xlink:href', d.image)
        .attr('x', -nodeSize / 2 + 2)
        .attr('y', -nodeSize / 2 + 2)
        .attr('width', nodeSize - 4)
        .attr('height', nodeSize - 4)
        .on('error', function() {
          d3.select(this).remove();
        });
    }
  });

  const textGroup = selection.append('g')
    .attr('class', 'text-group');

  textGroup.append('text')
    .attr('class', 'node-label')
    .attr('y', nodeSize / 2 + 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('font-weight', 500)
    .text(d => d.name);

  textGroup.each(function() {
    const text = d3.select(this).select('text');
    const bbox = text.node().getBBox();

    d3.select(this).insert('rect', 'text')
      .attr('x', bbox.x - 3)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 6)
      .attr('height', bbox.height + 4)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 3);
  });

  return selection;
}

// MARK: Dragging
function dragStarted(event) {
    if (!event.active) currentSimulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    if (event.subject.region) {
        const padding = 10;
        const minX = event.subject.region.x + padding;
        const maxX = event.subject.region.x + event.subject.region.width - padding;
        const minY = event.subject.region.y + padding;
        const maxY = event.subject.region.y + event.subject.region.height - padding;
        
        const newX = Math.max(minX, Math.min(maxX, event.x));
        const newY = Math.max(minY, Math.min(maxY, event.y));
        
        event.subject.fx = newX;
        event.subject.fy = newY;
        event.subject.x = newX;
        event.subject.y = newY;
    } else {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
}

function dragEnded(event) {
    if (!event.active) currentSimulation.alphaTarget(0);
}

loadData();
// main-circle.js - Circular Social Network Visualization

// Configuration
const width = 1400;
const height = 1400;
const nodeSize = 60;
const centerNodeSize = 100;

// House colors for borders
const houseColors = {
    'Slytherin': '#1a5f3b',
    'Ravenclaw': '#1e3a8a',
    'Gryffindor': '#991b1b',
    'Hufflepuff': '#ca8a04',
    'default': '#1f2937'
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

// D3 Visualization Setup
const svg = d3.select('#svg')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g');

// Create layers
const linksLayer = g.append('g').attr('class', 'links');
const nodesLayer = g.append('g').attr('class', 'nodes');

// Define arrow markers
const defs = svg.append('defs');
Object.keys(statusColors).forEach(status => {
    defs.append('marker')
        .attr('id', `arrow-${status}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', statusColors[status] || statusColors.default)
        .attr('d', 'M0,-5L10,0L0,5');
});

// Global state
let allNodes = [];
let allLinks = [];
let inactiveNodes = new Set();
let focusNodeId = null;

// Helper function to determine region
function getRegionKey(groups) {
    if (groups.includes('Outside of Hogwarts')) return 'Outside of Hogwarts';
    if (groups.includes('Hogwarts Staff')) {
        const house = groups.find(g => ['Slytherin', 'Ravenclaw', 'Gryffindor', 'Hufflepuff'].includes(g));
        return house ? `Hogwarts Staff+${house}` : 'Hogwarts Staff';
    }
    if (groups.includes('Student')) {
        const house = groups.find(g => ['Slytherin', 'Ravenclaw', 'Gryffindor', 'Hufflepuff'].includes(g));
        return house ? `Student+${house}` : 'Student';
    }
    if (groups.includes('Non-Academic Residents')) {
        const house = groups.find(g => ['Slytherin', 'Ravenclaw', 'Gryffindor', 'Hufflepuff'].includes(g));
        return house ? `Non-Academic Residents+${house}` : 'Non-Academic Residents';
    }
    return groups[0];
}

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

        allNodes = Array.from(allCharacterIds).map(id => {
            const charInfo = characterMap.get(id);
            const socialInfo = socialMap.get(id);
            const groups = socialInfo?.Groups || ['Outside of Hogwarts'];
            
            return {
                id,
                name: charInfo?.Name || id.replace(/([A-Z])/g, ' $1').trim(),
                image: charInfo?.image,
                groups,
                regionKey: getRegionKey(groups)
            };
        });

        // Process links to detect mutual relationships
        const linkMap = new Map();
        relationships.forEach(r => {
            const key = `${r.CharacterID}->${r.TargetCharacterID}`;
            linkMap.set(key, {
                source: r.CharacterID,
                target: r.TargetCharacterID,
                status: r.SocialCapitalStatus,
                capital: +r.SocialCapital
            });
        });
        
        // Store both directions separately for split coloring
        allLinks = [];
        const processed = new Set();
        
        linkMap.forEach((link, key) => {
            if (processed.has(key)) return;
            
            const reverseKey = `${link.target}->${link.source}`;
            const reverseLink = linkMap.get(reverseKey);
            
            if (reverseLink) {
                // Bidirectional - store both directions
                allLinks.push({
                    source: link.source,
                    target: link.target,
                    status: link.status,
                    reverseStatus: reverseLink.status,
                    isMutual: link.status === reverseLink.status
                });
                processed.add(key);
                processed.add(reverseKey);
            } else {
                // One-way
                allLinks.push({
                    source: link.source,
                    target: link.target,
                    status: link.status,
                    reverseStatus: null,
                    isMutual: false
                });
                processed.add(key);
            }
        });

        setupFilters();
        applyFilters();

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data files.');
    }
}

// Setup filter controls
function setupFilters() {
    const focusSelect = document.getElementById('focus-select');
    const sortedNodes = [...allNodes].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedNodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        focusSelect.appendChild(option);
    });
    
    focusSelect.addEventListener('change', (e) => {
        focusNodeId = e.target.value || null;
        applyFilters(focusNodeId);
    });
    
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
    focusNodeId = null;
    inactiveNodes.clear();
    document.getElementById('filter-all').checked = true;
    handleAllCheckbox(true);
}

// Apply filters and update visualization
function applyFilters(focusNodeId) {
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
    
    const visibleNodes = allNodes.filter(node => {
        // Apply group filters first
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
        
        // If there's a focus node, always include it even if filtered out
        if (focusNodeId && node.id === focusNodeId) return true;
        if (hasRole && !roleMatch) return false;
        if (hasHouse && !houseMatch) return false;
        
        // For other nodes with focus active, only show if connected to focus
        if (focusNodeId && node.id !== focusNodeId) {
            const isConnected = allLinks.some(link =>
                (link.source === focusNodeId && link.target === node.id) ||
                (link.target === focusNodeId && link.source === node.id)
            );
            if (!isConnected) return false;
        }
        
        return true;
    });
    
    // Sort nodes by house
    const sortedNodes = [...visibleNodes].sort((a, b) => {
        const houseOrder = { 'Slytherin': 1, 'Ravenclaw': 2, 'Hufflepuff': 3, 'Gryffindor': 4, 'none': 5 };
        const getHouse = (node) => {
            const house = node.groups.find(g => ['Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor'].includes(g));
            return house || 'none';
        };
        const houseA = getHouse(a);
        const houseB = getHouse(b);
        return (houseOrder[houseA] || 5) - (houseOrder[houseB] || 5);
    });
    
    const visibleNodeIds = new Set(sortedNodes.map(n => n.id));
    
    const visibleLinks = allLinks.filter(link => {
        if (focusNodeId) {
            return (link.source === focusNodeId || link.target === focusNodeId) &&
                   visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target);
        }
        return visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target);
    });
    
    updateVisualization(sortedNodes, visibleLinks);
}

// Update the visualization
function updateVisualization(nodes, links) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 200; // Increased padding
    let positions;

    if (focusNodeId) {
        // Focus mode: center node + circle around it
        const focusNode = nodes.find(n => n.id === focusNodeId);
        const otherNodes = nodes.filter(n => n.id !== focusNodeId);
        
        positions = new Map();
        positions.set(focusNodeId, { x: centerX, y: centerY });
        
        otherNodes.forEach((node, i) => {
            const angle = (i / otherNodes.length) * 2 * Math.PI - Math.PI / 2;
            positions.set(node.id, {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        });
    } else {
        // Circle mode: all nodes in circle
        positions = new Map();
        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
            positions.set(node.id, {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        });
    }
    
    // Update links
    const linkGroups = linksLayer.selectAll('.link-group')
        .data(links, d => `${d.source}-${d.target}`);
    
    linkGroups.exit().remove();
    
    const linkEnter = linkGroups.enter().append('g')
        .attr('class', 'link-group');
    
    drawLinks(linkEnter, positions);
    
    const allLinkGroups = linkEnter.merge(linkGroups);
    updateLinkPositions(allLinkGroups, positions);
    
    // Update nodes
    const nodeGroups = nodesLayer.selectAll('.node')
        .data(nodes, d => d.id);
    
    nodeGroups.exit().remove();
    
    const nodeEnter = nodeGroups.enter().append('g')
        .attr('class', 'node')
        .on('click', toggleNode);
    
    drawNodes(nodeEnter, positions);
    
    const allNodeGroups = nodeEnter.merge(nodeGroups);
    updateNodePositions(allNodeGroups, positions);
    updateNodeStates(allNodeGroups);
}

function drawLinks(selection, positions) {
    selection.each(function(d) {
        const group = d3.select(this);
        const sourcePos = positions.get(d.source);
        const targetPos = positions.get(d.target);
        
        if (d.reverseStatus && d.status !== d.reverseStatus) {
            // Split color line
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            group.append('path')
                .attr('class', 'link-path link-half-1')
                .attr('stroke', statusColors[d.status] || statusColors.default)
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('opacity', 0.6);
            
            group.append('path')
                .attr('class', 'link-path link-half-2')
                .attr('stroke', statusColors[d.reverseStatus] || statusColors.default)
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('opacity', 0.6);
        } else {
            // Single color line
            group.append('path')
                .attr('class', 'link-path')
                .attr('stroke', statusColors[d.status] || statusColors.default)
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('opacity', 0.6)
                .attr('marker-end', !d.isMutual ? `url(#arrow-${d.status})` : null);
        }
    });
}

function updateLinkPositions(selection, positions) {
    selection.each(function(d) {
        const group = d3.select(this);
        const sourcePos = positions.get(d.source);
        const targetPos = positions.get(d.target);
        
        const isActive = !inactiveNodes.has(d.source) && !inactiveNodes.has(d.target);
        group.style('opacity', isActive ? 1 : 0);
        
        if (d.reverseStatus && d.status !== d.reverseStatus) {
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            group.select('.link-half-1')
                .attr('d', `M ${sourcePos.x},${sourcePos.y} L ${midX},${midY}`);
            
            group.select('.link-half-2')
                .attr('d', `M ${midX},${midY} L ${targetPos.x},${targetPos.y}`);
        } else {
            group.select('.link-path')
                .attr('d', `M ${sourcePos.x},${sourcePos.y} L ${targetPos.x},${targetPos.y}`);
        }
    });
}

function drawNodes(selection, positions) {
    // Get house color for border
    const getHouseColor = (node) => {
        const house = node.groups.find(g => ['Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor'].includes(g));
        return house ? houseColors[house] : houseColors.default;
    };
    
    selection.append('circle')
        .attr('class', 'node-bg')
        .attr('r', d => d.id === focusNodeId ? centerNodeSize / 2 : nodeSize / 2)
        .attr('fill', 'white')
        .attr('stroke', d => getHouseColor(d))
        .attr('stroke-width', 4);
    
    selection.append('image')
        .attr('class', 'node-image')
        .attr('xlink:href', d => d.image || '')
        .attr('width', d => d.id === focusNodeId ? centerNodeSize - 10 : nodeSize - 10)
        .attr('height', d => d.id === focusNodeId ? centerNodeSize - 10 : nodeSize - 10)
        .attr('x', d => d.id === focusNodeId ? -(centerNodeSize - 10) / 2 : -(nodeSize - 10) / 2)
        .attr('y', d => d.id === focusNodeId ? -(centerNodeSize - 10) / 2 : -(nodeSize - 10) / 2)
        .attr('clip-path', 'circle()')
        .on('error', function() { d3.select(this).remove(); });
    
    // Add staff badge positioned based on angle
    selection.each(function(d) {
        if (d.groups.includes('Hogwarts Staff') && d.id !== focusNodeId) {
            const pos = positions.get(d.id);
            const centerX = width / 2;
            const centerY = height / 2;
            const angle = Math.atan2(pos.y - centerY, pos.x - centerX);
            
            // Position badge on the outside of the circle
            const badgeDistance = nodeSize / 2 + 12;
            const badgeX = Math.cos(angle) * badgeDistance;
            const badgeY = Math.sin(angle) * badgeDistance;
            
            d3.select(this).append('image')
                .attr('class', 'staff-badge')
                .attr('xlink:href', 'badge.png')
                .attr('width', 24)
                .attr('height', 24)
                .attr('x', badgeX - 12)
                .attr('y', badgeY - 12);
        }
    });
    
    selection.append('rect')
        .attr('class', 'node-inactive-overlay')
        .attr('width', d => d.id === focusNodeId ? centerNodeSize : nodeSize)
        .attr('height', d => d.id === focusNodeId ? centerNodeSize : nodeSize)
        .attr('x', d => d.id === focusNodeId ? -centerNodeSize / 2 : -nodeSize / 2)
        .attr('y', d => d.id === focusNodeId ? -centerNodeSize / 2 : -nodeSize / 2)
        .attr('fill', 'rgba(128, 128, 128, 0.6)')
        .attr('rx', d => d.id === focusNodeId ? centerNodeSize / 2 : nodeSize / 2)
        .style('display', 'none');
    
    // 1. Create a group per node
const textGroup = selection.append('g')
  .attr('class', 'text-group');

// 2. Append the text
const labels = textGroup.append('text')
  .attr('class', 'node-label')
  .attr('y', d => d.id === focusNodeId ? centerNodeSize / 2 + 25 : nodeSize / 2 + 20)
  .attr('text-anchor', 'middle')
  .attr('font-size', d => d.id == focusNodeId ? 16 : 12)
  .attr('font-weight', 600)
  .text(d => d.name);

// 3. Once text is in the DOM, add rect behind it
labels.each(function(d) {
  const textNode = this;
  const bbox = textNode.getBBox();   // must be after text is rendered

  d3.select(this.parentNode)
    .insert('rect', 'text')          // insert before the text
    .attr('x', bbox.x - 4)
    .attr('y', bbox.y - 2)
    .attr('width', bbox.width + 8)
    .attr('height', bbox.height + 4)
    .attr('fill', 'white')
    .attr('stroke', '#e5e7eb')
    .attr('stroke-width', 1)
    .attr('rx', 4);
});

}

function updateNodePositions(selection, positions) {
  const getHouseColor = (node) => {
    const house = node.groups.find(g => ['Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor'].includes(g));
    return house ? houseColors[house] : houseColors.default;
  };

  selection.attr('transform', d => {
    const pos = positions.get(d.id);
    return `translate(${pos.x},${pos.y})`;
  });

  // Update other elements...
  selection.select('.node-bg')
    .attr('r', d => d.id === focusNodeId ? centerNodeSize / 2 : nodeSize / 2)
    .attr('stroke', d => getHouseColor(d));

  selection.select('.node-image')
    .attr('width', d => d.id === focusNodeId ? centerNodeSize - 10 : nodeSize - 10)
    .attr('height', d => d.id === focusNodeId ? centerNodeSize - 10 : nodeSize - 10)
    .attr('x', d => d.id === focusNodeId ? -(centerNodeSize - 10) / 2 : -(nodeSize - 10) / 2)
    .attr('y', d => d.id === focusNodeId ? -(centerNodeSize - 10) / 2 : -(nodeSize - 10) / 2);

  // CRITICAL: Update text position AND font-size FIRST
  const labels = selection.select('.node-label')
    .attr('y', d => d.id === focusNodeId ? centerNodeSize / 2 + 25 : nodeSize / 2 + 20)
    .attr('font-size', d => d.id === focusNodeId ? 16 : 12);  // This makes text larger

  // THEN recreate backgrounds based on NEW text size
  selection.select('.text-group').selectAll('rect').remove(); // Clear old rects
  labels.each(function(d) {
    const textNode = this;
    const bbox = textNode.getBBox();  // Now gets CORRECT larger size for focus node
    
    d3.select(this.parentNode)  // .text-group
      .insert('rect', 'text')
      .attr('x', bbox.x - 4)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 8)
      .attr('height', bbox.height + 4)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 4);
  });
}


function updateNodeStates(selection) {
    selection.classed('inactive', d => inactiveNodes.has(d.id));
    selection.select('.node-inactive-overlay')
        .style('display', d => inactiveNodes.has(d.id) ? 'block' : 'none');
}

function toggleNode(event, d) {
    if (d.id === focusNodeId) return; // Can't toggle focus node
    
    if (inactiveNodes.has(d.id)) {
        inactiveNodes.delete(d.id);
    } else {
        inactiveNodes.add(d.id);
    }
    
    applyFilters();
}

loadData();